const express = require('express');
const mqtt = require('mqtt');
const path = require('path');

const app = express();
const readings = [];
const client = mqtt.connect(process.env.MQTT_URL || 'mqtt://localhost:1883', { reconnectPeriod: 2000 });
app.use(express.static(path.join(__dirname, 'public')));

client.on('connect', () => {
  console.log('Connected to MQTT broker');
  client.subscribe('iot/+/telemetry');
});
client.on('error', (error) => console.error('MQTT error:', error.message));
client.on('message', (topic, payload) => {
  try {
    const data = JSON.parse(payload.toString());
    const temperatureC = Number(data.temperatureC);
    const humidity = Number(data.humidity);
    if (!Number.isFinite(temperatureC) || !Number.isFinite(humidity)) return;
    readings.unshift({
      deviceId: String(data.deviceId || topic.split('/')[1]).slice(0, 64),
      temperatureC: Math.round(temperatureC * 10) / 10,
      humidity: Math.round(humidity * 10) / 10,
      timestamp: data.timestamp || new Date().toISOString(),
    });
    if (readings.length > 120) readings.length = 120;
  } catch (error) { console.warn('Ignoring invalid telemetry:', error.message); }
});
app.get('/api/health', (_req, res) => res.json({ status: 'ok', mqttConnected: client.connected }));
app.get('/api/readings', (_req, res) => res.json({ readings }));
const server = app.listen(Number(process.env.PORT || 3000), () => console.log('Dashboard ready'));
function shutdown() { server.close(() => client.end(false, () => process.exit(0))); }
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
