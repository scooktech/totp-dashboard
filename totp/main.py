# main.py
#
# Waveshare RP2350 Touch e-Paper 1.54
#

from machine import Pin
import framebuf
import time

from waveshare.pico_epaper_1in54 import EPD_1in54
from waveshare.key_events import Key, GpioKey

from totp import get_totp

# CONFIGURATION
POWER_BUTTON_PIN = 24

BLACK = 0x00
WHITE = 0xFF

# APPLICATION STATE
screen_on = False
click_requested = False

last_second = -1
last_update_time = 0

# HARDWARE INITIALIZATION
epd = EPD_1in54()

power_button_reader = GpioKey(
    POWER_BUTTON_PIN,
    pull=Pin.PULL_UP,
    active_low=True,
)

# TEXT FUNCTIONS
def draw_scaled_text(text, x, y, scale=1):
    """
    Draw text using the standard 8x8 font at a larger scale.
    """

    if not text:
        return

    if scale <= 1:
        epd.text(text, x, y, BLACK)
        return

    text_width = len(text) * 8
    text_height = 8

    source_buffer = bytearray(
        text_width * text_height // 8
    )

    source = framebuf.FrameBuffer(
        source_buffer,
        text_width,
        text_height,
        framebuf.MONO_HLSB,
    )

    source.fill(WHITE)
    source.text(text, 0, 0, BLACK)

    for source_y in range(text_height):
        for source_x in range(text_width):
            if source.pixel(source_x, source_y) == BLACK:
                epd.fill_rect(
                    x + source_x * scale,
                    y + source_y * scale,
                    scale,
                    scale,
                    BLACK,
                )

def draw_centered_text(text, y, scale=1):
    """
    Draw text centered horizontally on the display.
    """

    text_width = len(text) * 8 * scale
    x = (epd.width - text_width) // 2

    draw_scaled_text(text, x, y, scale)

# SCREEN FUNCTIONS
def clear_screen():
    """
    Clear the display and leave it blank.
    """

    epd.init(epd.full_update)
    epd.Clear(0xFF)
    epd.init(epd.part_update)

def draw_screen():
    """
    Draw the current TOTP code and countdown.
    """

    code, time_text, remaining, unix_time = get_totp()

    epd.fill(WHITE)

    # Title.
    draw_centered_text("TOTP", 8, scale=2)

    epd.line(10, 32, 190, 32, BLACK)

    # TOTP code.
    visible_code = code[:3] + " " + code[3:]
    draw_centered_text(visible_code, 48, scale=3)

    # Current time.
    epd.text("TIME", 15, 108, BLACK)
    draw_scaled_text(time_text, 58, 104, scale=2)

    # Remaining time.
    epd.text("EXP", 15, 145, BLACK)
    draw_scaled_text("{} S".format(remaining), 58, 140, scale=2)

    return unix_time

def show_screen():
    """
    Draw and show the TOTP screen.
    """

    global last_second
    global last_update_time

    last_second = draw_screen()
    last_update_time = time.ticks_ms()

    epd.init(epd.full_update)
    epd.displayPartBaseImage(epd.buffer)
    epd.init(epd.part_update)

def update_screen():
    """
    Update the screen only when the displayed second changes.
    """

    global last_second

    unix_time = draw_screen()

    if unix_time != last_second:
        epd.displayPartial(epd.buffer)
        last_second = unix_time

# BUTTON FUNCTIONS
def on_power_event(name, event, value):
    """
    Request a screen toggle when the button is clicked.
    """

    global click_requested

    if event == "click":
        click_requested = True

power_key = Key(
    "power",
    power_button_reader.pressed,
    on_power_event,
)

def process_button():
    """
    Turn the screen on or off.
    """

    global click_requested
    global screen_on
    global last_update_time

    if not click_requested:
        return

    click_requested = False

    if screen_on:
        clear_screen()
        screen_on = False
        return

    show_screen()
    screen_on = True
    last_update_time = time.ticks_ms()

# STARTUP
# Start with the display blank.
clear_screen()

# MAIN LOOP
while True:
    now = time.ticks_ms()

    power_key.poll(now)
    process_button()

    if screen_on:
        if time.ticks_diff(now, last_update_time) >= 1000:
            update_screen()
            last_update_time = now

    time.sleep_ms(10)

