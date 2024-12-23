
const mongoose = require("mongoose");

const mongoURI = process.env.MONGO_URI || "mongodb+srv://admin123:1@cluster0.wzznk.mongodb.net/Data2"; 

mongoose.connect(mongoURI);

const db = mongoose.connection;

// Xử lý kết nối MongoDB
db.on("error", console.error.bind(console, "Lỗi khi kết nối MongoDB:"));
db.once("open", function () {
  console.log("Đã kết nối MongoDB");
});

// Define schema và model cho dữ liệu lưu vào MongoDB
const dataSchema = new mongoose.Schema(
  {
    temperature: Number,
    humidity: Number,
    lux: Number,
    pressure: Number,
    timestamp: { type: Date, default: Date.now },
  },
  { collection: "save_data" }
);

const Data = mongoose.model("Data", dataSchema);

// Định nghĩa schema cho dữ liệu cảm biến
const sensorSchema = new mongoose.Schema({
  temperature: Number,
  humidity: Number,
  light: Number,
  voltage: Number,
  current: Number,
  power: Number,
  totalEnergy: Number,
  timestamp: String,
  source: String,
});
const SensorData = mongoose.model('SensorData', sensorSchema);

const weatherSchema = new mongoose.Schema({
  temperature: Number,
  humidity: Number,
  timestamp: String,
  source: String,
});
const Weather = mongoose.model('Weather', weatherSchema);

module.exports = {
  Data,
  SensorData,
  Weather,
};
