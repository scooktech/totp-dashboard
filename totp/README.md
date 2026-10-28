# TOTP Device Firmware

This directory contains the MicroPython files used to run the TOTP functionality on an RP2350-based device with an e-paper display.

The device generates and displays a time-based one-time password locally. The code can then be entered into the web application's authentication flow for testing.

## Requirements

- RP2350-based device
- MicroPython firmware
- Compatible e-paper display
- USB connection
- [Thonny](https://thonny.org/)

## Project structure

```text
totp/
├── boot.py
├── main.py
├── README.md
├── totp.py
└── waveshare/
    ├── key_events.py
    ├── pico_epaper_1in54.py
    └── README.md
```

## Uploading and running the code

The firmware was uploaded to and executed on the device using Thonny.

Upload the following Python files to the device:

```text
boot.py
main.py
totp.py
waveshare/key_events.py
waveshare/pico_epaper_1in54.py
```

Preserve the `waveshare` directory structure on the device:

```text
/waveshare/key_events.py
/waveshare/pico_epaper_1in54.py
```

### General workflow

1. Connect the device to the computer via USB.
2. Open Thonny.
3. Select the appropriate MicroPython interpreter and device port.
4. Open the device file browser.
5. Upload `boot.py`, `main.py` and `totp.py` to the device root directory.
6. Create a directory named `waveshare` on the device.
7. Upload `key_events.py` and `pico_epaper_1in54.py` into the `waveshare` directory.
8. Disconnect the device from the computer and reconnect it. This allows the device to restart and execute `boot.py`, which configures the device to maintain the battery-powered operating mode.
9. From Thonny, run `main.py` directly. Running the script from Thonny also allows the current computer time to be transferred to the device for TOTP time synchronisation.

MicroPython loads `boot.py` during startup and then executes `main.py`.

## Time correction

If the device time requires a timezone or UTC offset adjustment, update the following variable in `totp.py`:

```python
RTC_UTC_CORRECTION_SECONDS
```

The value should be specified in seconds.

For example:

```python
RTC_UTC_CORRECTION_SECONDS = 0
```

Adjust this value according to the timezone configuration required by the device and the TOTP implementation.
