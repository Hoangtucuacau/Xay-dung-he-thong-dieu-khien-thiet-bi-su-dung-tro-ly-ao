const mqtt = require('mqtt');
const options = {
    username: "abc",
    password: "jp4jfwJHNXaql5gJ9xZzF8PNJm7oZ2ND",
  };
  
const mqttClient = mqtt.connect('mqtt://mqttvcloud.innoway.vn', options);
module.exports = { mqttClient }; 