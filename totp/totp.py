# totp.py

from machine import RTC
import struct
import hashlib

# CONFIGURATION
TOTP_SECRET = "JBSWY3DPEHPK3PXP"
TOTP_PERIOD = 30

# Example correction hours
# +1h =  1 * 60 * 60
#  0h =  0 * 60 * 60
# -1h = -1 * 60 * 60
RTC_UTC_CORRECTION_SECONDS = 0 * 60 * 60

rtc = RTC()

# BASE32
def base32_decode(secret_string):
    alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"
    accumulator = 0
    bit_count = 0
    decoded_bytes = bytearray()

    clean_string = secret_string.upper().rstrip("=")

    for char in clean_string:
        if char not in alphabet:
            continue

        char_value = alphabet.index(char)

        accumulator = (accumulator << 5) | char_value
        bit_count += 5

        if bit_count >= 8:
            bit_count -= 8
            byte_extracted = (accumulator >> bit_count) & 0xFF
            decoded_bytes.append(byte_extracted)

    return bytes(decoded_bytes)

# TIME
def is_leap_year(year):
    return year % 4 == 0 and (year % 100 != 0 or year % 400 == 0)


def rtc_to_unix_time(datetime_tuple):
    year, month, day, _, hour, minute, second, _ = datetime_tuple

    total_days = 0

    for current_year in range(1970, year):
        if is_leap_year(current_year):
            total_days += 366
        else:
            total_days += 365

    days_in_months = [
        31, 28, 31, 30, 31, 30,
        31, 31, 30, 31, 30, 31,
    ]

    if is_leap_year(year):
        days_in_months[1] = 29

    for current_month in range(1, month):
        total_days += days_in_months[current_month - 1]

    total_days += day - 1

    total_seconds = (
        total_days * 86400
        + hour * 3600
        + minute * 60
        + second
    )
    return total_seconds + RTC_UTC_CORRECTION_SECONDS

# HMAC-SHA1
def hmac_sha1(key, message):
    block_size = 64

    if len(key) > block_size:
        key = hashlib.sha1(key).digest()

    if len(key) < block_size:
        key += b"\x00" * (block_size - len(key))

    inner_pad = bytes(byte ^ 0x36 for byte in key)
    outer_pad = bytes(byte ^ 0x5C for byte in key)

    inner_hash = hashlib.sha1(inner_pad + message).digest()
    outer_hash = hashlib.sha1(outer_pad + inner_hash).digest()

    return outer_hash

# TOTP
def get_totp():
    datetime_tuple = rtc.datetime()

    unix_time = rtc_to_unix_time(datetime_tuple)
    time_step_counter = unix_time // TOTP_PERIOD

    counter_bytes = struct.pack(
        ">Q",
        time_step_counter,
    )

    secret_bytes = base32_decode(TOTP_SECRET)
    crypto_hash = hmac_sha1(secret_bytes, counter_bytes)

    offset = crypto_hash[-1] & 0x0F

    byte1 = crypto_hash[offset] & 0x7F
    byte2 = crypto_hash[offset + 1]
    byte3 = crypto_hash[offset + 2]
    byte4 = crypto_hash[offset + 3]

    binary_code = (
        (byte1 << 24)
        | (byte2 << 16)
        | (byte3 << 8)
        | byte4
    )

    numeric_token = binary_code % 1000000
    totp_code = "{:06d}".format(numeric_token)

    formatted_time = "{:02d}:{:02d}:{:02d}".format(
        datetime_tuple[4],
        datetime_tuple[5],
        datetime_tuple[6],
    )

    remaining_seconds = TOTP_PERIOD - (
        unix_time % TOTP_PERIOD
    )

    return (
        totp_code,
        formatted_time,
        remaining_seconds,
        unix_time,
    )
