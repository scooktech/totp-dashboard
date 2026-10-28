# boot.py

from machine import Pin
import time
import builtins

# CONFIGURATION
BATTERY_ENABLE_PIN = 28
BATTERY_ENABLE_LEVEL = 1
BATTERY_STARTUP_DELAY_MS = 50

QUIET_CONSOLE = True

# BATTERY POWER
battery_enable = Pin(
    BATTERY_ENABLE_PIN,
    Pin.OUT,
    value=BATTERY_ENABLE_LEVEL,
)

time.sleep_ms(BATTERY_STARTUP_DELAY_MS)

# CONSOLE
if QUIET_CONSOLE:
    def quiet_print(*args, **kwargs):
        pass

    builtins.print = quiet_print
