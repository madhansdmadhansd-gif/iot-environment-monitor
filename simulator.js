const mqtt = require('mqtt');
const deviceId = process.env.DEVICE_ID || 'demo-sensor';
const interval = Number(process.env.PUBLISH_INTERVAL_MS || 3000);
const client = mqtt.connect(process.env.MQTT_URL || 'mqtt://localhost:1883', { reconnectPeriod: 2000 });
let tick = 0;
client.on('connect', () => {
  console.log(`Publishing demo sensor ${deviceId}`);
  publish();
  setInterval(publish, interval);
});
client.on('error', (error) => console.error('MQTT error:', error.message));
function publish() {
  tick++;
  const reading = {
    deviceId,
    temperatureC: Math.round((22 + Math.sin(tick / 8) * 2 + (Math.random() - .5) * .4) * 10) / 10,
    humidity: Math.round((48 + Math.cos(tick / 10) * 7 + (Math.random() - .5) * 1.5) * 10) / 10,
    timestamp: new Date().toISOString(),
  };
  client.publish(`iot/${deviceId}/telemetry`, JSON.stringify(reading), { qos: 1 });
  console.log(`${reading.temperatureC} °C · ${reading.humidity}% humidity`);
}
process.on('SIGINT', () => client.end(false, () => process.exit(0)));
