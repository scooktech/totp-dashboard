# TOTP Dashboard

Authentication demo with:

- React and Vite frontend
- Node.js and Express backend
- PostgreSQL database
- Password login
- TOTP two-factor authentication
- Protected API route
- RP2350 MicroPython ePaper authenticator

## Demo

The following video shows the main authentication flow, including the web application and the RP2350-based ePaper authenticator.

https://github.com/user-attachments/assets/060a7472-a607-49d8-bb35-2be48bf0f379

## Requirements

- Git
- Podman
- podman-compose
- Node.js
- pnpm

Docker Compose should also work with the same compose file.

## Start the project

Clone the repository:

```bash
git clone https://github.com/scooktech/totp-dashboard.git
cd totp-dashboard
```

Create the local environment file from the example:

```bash
cp .env.example .env
```

Review the values in `.env` and adjust them if necessary before starting the project.

Start the containers:

Using Podman:

```bash
podman-compose up -d
```

Using Docker Compose:

```bash
docker compose up -d
```

Open the frontend:

```text
http://localhost:8080
```

The project contains a demonstration account for testing:

```text
Username: test
Password: password1234
```

## Testing without the RP2350 device

If you do not have access to the RP2350 device, you can use a local TOTP application or an online TOTP generator to produce the code used by this demonstration.

Use the following settings:

- Secret: `JBSWY3DPEHPK3PXP`
- Algorithm: `SHA-1`
- Digits: `6`
- Period: `30 seconds`

Available online tools include:

- [Benri TOTP Generator](https://benri.dev/en/tools/totp-generator)
- [ZeroTool TOTP Generator](https://zerotool.dev/tools/totp-generator/)
- [TOTP.fyi](https://totp.fyi/)
- [UtilityKit TOTP Generator](https://utilitykit.tools/totp-generator)

The code changes every 30 seconds, so the TOTP generator, backend and RP2350 device must have sufficiently synchronised clocks.

The secret shown above is intentionally public and is used only for this demonstration. Never enter a real production TOTP secret or a personal authentication secret into an online tool.

## Automated end-to-end testing

The project includes a small Playwright test suite covering the main authentication behaviours:

- successful login with valid credentials and a valid TOTP code;
- rejection of an invalid TOTP code;
- rejection of protected API requests without a valid authentication token.

The tests are located in:

```text
tests-e2e/specs
```

The TOTP code used by the successful test is generated locally with the public demonstration secret. The tests do not require physical access to the RP2350 device.

### Install the test dependencies

From the `tests-e2e` directory:

```bash
cd tests-e2e
pnpm install
pnpm exec playwright install chromium
```

The test environment uses the following values:

```text
PLAYWRIGHT_BASE_URL=http://localhost:8080
DEMO_USERNAME=test
DEMO_PASSWORD=password1234
DEMO_TOTP_SECRET=JBSWY3DPEHPK3PXP
```

These values should be configured in:

```text
tests-e2e/.env
```

### Run the automated tests

Start the main application first from the project root:

```bash
docker compose up -d
```

or:

```bash
podman-compose up -d
```

Then run the tests from `tests-e2e`:

```bash
pnpm test
```

To run the tests with the browser visible:

```bash
pnpm test:headed
```

To open the Playwright report:

```bash
pnpm test:report
```

The Playwright tests verify the application through the browser and the protected API endpoint. They are intended as focused regression checks for the most important authentication paths rather than as a complete production test suite.

## Project scope

This is a technical authentication prototype for demonstrating:

- full-stack system integration;
- password and TOTP authentication;
- protected backend resources;
- offline TOTP generation on an RP2350 device;
- local development with containers;
- automated end-to-end testing.

The project is not intended to be used as a production authentication system without additional security review, hardening and operational controls.
