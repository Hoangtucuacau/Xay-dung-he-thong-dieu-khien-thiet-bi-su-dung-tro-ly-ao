const {SensorData} = require('./db'); 

const getLatestSensorData = async (req, res) => {
  try {
    const latestData = await SensorData.findOne().sort({ timestamp: -1 }); // Sắp xếp theo timestamp giảm dần, lấy 1 bản ghi

    if (!latestData) {
      return res.status(404).send("Không tìm thấy dữ liệu mới nhất");
    }

    // Chuẩn bị dữ liệu phản hồi
    const responseData = {
      temperature: latestData.temperature,
      humidity: latestData.humidity,
      timestamp: latestData.timestamp
    };

    // Trả dữ liệu về client
    res.status(200).json(responseData);
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu từ MongoDB:", error);
    res.status(500).send("Lỗi khi lấy dữ liệu");
  }
};
module.exports = {getLatestSensorData};
