// Hàm xử lý lấy dữ liệu từ MongoDB
const { SensorData } = require('./db');
const getSensorData = async (req, res) => {
    try {
      const sensorData = await SensorData.find(); 
      res.json(sensorData);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu từ MongoDB:", error);
      res.status(500).send("Lỗi khi lấy dữ liệu");
    }
  };
  module.exports = { getSensorData };