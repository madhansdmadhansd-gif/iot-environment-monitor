# IoT Environment Monitor

A starter room climate monitor: an ESP32 with a DHT22 publishes temperature and humidity over MQTT; a Node.js service collects readings and a live web dashboard shows them. A simulator runs without hardware.

## Quick start

Requires Docker Desktop with Compose and Node.js 20+.

1. Copy `.env.example` to `.env` (optional).
2. Start the broker and dashboard: `docker compose up --build`
3. In another terminal: `npm install && npm run simulate`
4. Visit http://localhost:3000

## Use an ESP32

Install Arduino libraries DHT sensor library, Adafruit Unified Sensor, and PubSubClient. Open `firmware/esp32_dht22.ino`, set Wi-Fi credentials and the computer's LAN IP for `MQTT_HOST`, then upload to an ESP32. Wire the DHT22 data pin to GPIO 4. The device publishes to `iot/<device-id>/telemetry` every five seconds.

## API

- `GET /api/health` — app and MQTT status.
- `GET /api/readings` — up to 120 recent readings.

Mosquitto allows anonymous access for local setup. Add authentication, TLS, and network restrictions before exposing it beyond a trusted network.
