#include <Wire.h>
#include <Adafruit_INA219.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <DHT.h>
#include <ArduinoJson.h>
#include <PubSubClient.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <ESP32Servo.h>

#define DHTPIN 5
#define DHTTYPE DHT22
#define LED_PIN 2  
#define Light 34 
#define BUZZER_PIN 16
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64 
#define OLED_RESET -1   
#define FAN_PIN 15     
#define SERVO_PIN 17          

Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

const char* ssid = "ST-Home T6";
const char* password = "hd18051906";
const char* serverName = "http://192.168.106.11:8500/sensor";
const char* mqtt_server = "mqttvcloud.innoway.vn"; 
const char* mqtt_led = "remote_led";          
const char* mqtt_camera = "recognition"; 
const char* mqtt_fan = "remote_fan";
const char* mqtt_servo = "remote_servo";


const char* mqtt_user = "abc";  
const char* mqtt_pass = "jp4jfwJHNXaql5gJ9xZzF8PNJm7oZ2ND";   

WiFiClient espClient;
PubSubClient client(espClient);

DHT dht(DHTPIN, DHTTYPE);

Adafruit_INA219 ina219;
Servo myServo;

bool buzzerActive = false; 
unsigned long previousMillis = 0;
const long buzzerOnTime = 3000;  
const long buzzerOffTime = 2000;  

// Kết nối WiFi
void setup_wifi() {
  delay(10);
  Serial.println();
  Serial.print("Connecting to WiFi...");
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
}

// Xử lý khi nhận tin nhắn từ MQTT
void callback(char* topic, byte* message, unsigned int length) {
  Serial.print("Message arrived on topic: ");
  Serial.println(topic);
  String msg;

  for (int i = 0; i < length; i++) {
    msg += (char)message[i];
  }
  Serial.println("Message: " + msg);

  if (String(topic) == mqtt_led) { 
    if (msg == "on") {
      digitalWrite(LED_PIN, HIGH);  
      Serial.println("LED is ON");
    } else if (msg == "off") {
      digitalWrite(LED_PIN, LOW);   
      Serial.println("LED is OFF");
    } else {
      Serial.println("Unknown command. No action taken.");
    }
  }

  if (String(topic) == mqtt_camera) { 
    if (msg == "2") {
      buzzerActive = true;  
      Serial.println("Buzzer is ON and will beep every 3s");
    } else if (msg == "3") {
      buzzerActive = false;  
      digitalWrite(BUZZER_PIN, LOW); 
      Serial.println("Buzzer is OFF");
    } else {
      Serial.println("Unknown command for recognition topic. No action taken.");
    }
  }

  if (String(topic) == mqtt_fan) {
    if (msg == "on") {
      digitalWrite(FAN_PIN, LOW);  
      Serial.println("Fan is ON");
    } else if (msg == "off") {
      digitalWrite(FAN_PIN, HIGH);   
      Serial.println("Fan is OFF");
    } else {
      Serial.println("Unknown command for relay_fan topic. No action taken.");
    }
  }

  if (String(topic) == mqtt_servo) {
    if (msg == "on") {
      myServo.write(90); 
      Serial.println("Servo is ON");
    } else if (msg == "off") {
      myServo.write(0); 
      Serial.println("Servo is OFF");
    } else {
      Serial.println("Unknown command for relay_servo topic. No action taken.");
    }
  }
}

void reconnect() {
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    if (client.connect("ESP32Client", mqtt_user, mqtt_pass)) {
      Serial.println("connected to MQTT broker");
      client.subscribe(mqtt_led);  
      client.subscribe(mqtt_camera); 
      client.subscribe(mqtt_fan); 
      client.subscribe(mqtt_servo); 
      Serial.print("Subscribed to topics: ");
      Serial.println(mqtt_led);
      Serial.println(mqtt_camera);
      Serial.println(mqtt_fan);
      Serial.println(mqtt_servo);
    } else {
      Serial.print("failed to connect, rc=");
      Serial.print(client.state());
      Serial.println(" - Trying again in 5 seconds...");
      delay(5000);
    }
  }
}

void setup() {
  Serial.begin(115200);
  pinMode(LED_PIN, OUTPUT); 
  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, LOW); 
  pinMode(FAN_PIN, OUTPUT);   
  pinMode(SERVO_PIN, OUTPUT);
  dht.begin();
  setup_wifi();
  
  Wire.begin(21, 22);
  if (!ina219.begin()) {
    Serial.println("Không thể tìm thấy cảm biến INA219");
    while (1);
  }

  client.setServer(mqtt_server, 1883);  
  client.setCallback(callback);  

  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
  Serial.println(F("SSD1306 allocation failed"));
  while (true);  
  }
  display.clearDisplay();
  display.setTextSize(1); 
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(0, 0);
  display.println(F("OLED Initialized"));
  display.display();
  delay(1000); 
  display.clearDisplay();     

  myServo.attach(SERVO_PIN);
}

void loop() {
  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();
  int lightValue = analogRead(Light); 
  float voltage = ina219.getBusVoltage_V(); 
  float current = ina219.getCurrent_mA();   
  float power = ina219.getPower_mW();       
  float totalEnergy = power * 0.005; // Giả sử đơn vị là mWh, tính trên chu kỳ 5 giây (0.005 giờ)
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  unsigned long currentMillis = millis(); 

  if (buzzerActive) {
    if (digitalRead(BUZZER_PIN) == LOW && currentMillis - previousMillis >= buzzerOffTime) {
      digitalWrite(BUZZER_PIN, HIGH); 
      previousMillis = currentMillis; 
    } 
    else if (digitalRead(BUZZER_PIN) == HIGH && currentMillis - previousMillis >= buzzerOnTime) {
      digitalWrite(BUZZER_PIN, LOW); 
      previousMillis = currentMillis;  
    }
  }

  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;

    if (isnan(temperature) || isnan(humidity)) {
      Serial.println("Failed to read from DHT sensor!");
      delay(5000);
      return;
    }

    StaticJsonDocument<256> doc; 
    doc["temperature"] = temperature;
    doc["humidity"] = humidity;
    doc["light"] = lightValue; 
    doc["voltage"] = voltage; 
    doc["current"] = current; 
    doc["power"] = power; 
    doc["totalEnergy"] = totalEnergy;

    String jsonPayload;
    serializeJson(doc, jsonPayload);

    Serial.println("Sending HTTP POST request:");
    Serial.println(jsonPayload);

    http.begin("http://192.168.106.11:8500/sensor");
    http.addHeader("Content-Type", "application/json");  

    // Gửi dữ liệu JSON tới server dưới dạng POST
    int httpResponseCode = http.POST(jsonPayload);

    // Kiểm tra phản hồi từ server
    if (httpResponseCode > 0) {
      String response = http.getString(); 
      Serial.print("HTTP Response code: ");
      Serial.println(httpResponseCode);
      Serial.println("Response: " + response);
    } else {
      Serial.println("Error: " + http.errorToString(httpResponseCode));
    }

    http.end();
  } else {
    Serial.println("WiFi not connected");
  } 

  display.clearDisplay();
  display.setCursor(0, 0);
  display.println("Temp: " + String(temperature) + " C");
  display.println("Humidity: " + String(humidity) + " %");
  display.println("Light: " + String(lightValue));
  display.println("Energy: " + String(totalEnergy) + " mWh");
  display.display();

 delay(5000); 
}