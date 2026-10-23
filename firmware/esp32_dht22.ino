#include <WiFi.h>
#include <PubSubClient.h>
#include <DHT.h>

const char* WIFI_SSID = "YOUR_WIFI_NAME";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";
const char* MQTT_HOST = "192.168.1.20"; // Computer LAN IP, not localhost.
const int MQTT_PORT = 1883;
const char* DEVICE_ID = "esp32-living-room";
#define DHT_PIN 4
#define DHT_TYPE DHT22
WiFiClient wifiClient;
PubSubClient mqttClient(wifiClient);
DHT dht(DHT_PIN, DHT_TYPE);
unsigned long lastPublish = 0;

void setup() {
  Serial.begin(115200);
  dht.begin();
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) { delay(500); Serial.print("."); }
  mqttClient.setServer(MQTT_HOST, MQTT_PORT);
}
void loop() {
  if (!mqttClient.connected()) {
    if (!mqttClient.connect(DEVICE_ID)) { delay(2000); return; }
  }
  mqttClient.loop();
  if (millis() - lastPublish < 5000) return;
  lastPublish = millis();
  const float temperatureC = dht.readTemperature();
  const float humidity = dht.readHumidity();
  if (isnan(temperatureC) || isnan(humidity)) return;
  char payload[160], topic[96];
  snprintf(payload, sizeof(payload),
    "{\"deviceId\":\"%s\",\"temperatureC\":%.1f,\"humidity\":%.1f,\"timestamp\":\"%lu\"}",
    DEVICE_ID, temperatureC, humidity, millis());
  snprintf(topic, sizeof(topic), "iot/%s/telemetry", DEVICE_ID);
  mqttClient.publish(topic, payload);
  Serial.println(payload);
}
