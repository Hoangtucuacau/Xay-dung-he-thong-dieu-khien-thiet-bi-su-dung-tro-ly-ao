//Call data thời tiết
const axios = require('axios');
const { Weather } = require('./db');  

async function getWeatherData(io) {
  const apiKey = "ccc9c2edbfd200210a1ea70414c23fe6"; 
  const city = "Nam Dinh";
  const apiUrl = `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

  try {
    const response = await axios.get(apiUrl);
    const { temp, humidity } = response.data.main;

    const currentUTCDate = new Date();
    currentUTCDate.setHours(currentUTCDate.getHours() + 7); // Điều chỉnh múi giờ cho Việt Nam

    const newData = {
      temperature: parseFloat(temp),
      humidity: parseFloat(humidity),
      timestamp: currentUTCDate.toISOString(),
      source: "weather"
    };

    const weather = new Weather(newData);
    await weather.save(); // Lưu dữ liệu vào MongoDB

    console.log("Đã lưu dữ liệu từ web thời tiết vào MongoDB - Temperature:", newData.temperature, "Humidity:", newData.humidity);

    // Gửi dữ liệu qua WebSocket
    io.emit("temperature_io_2", newData.temperature.toFixed(2));
    io.emit("humidity_io_2", newData.humidity.toFixed(2));

    return { temperature: temp, humidity: humidity };
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu thời tiết:", error);
    return null;
  }
}

// Hàm để cập nhật dữ liệu thời tiết liên tục
function startWeatherUpdates(io, interval) {
  getWeatherData(io); // Lấy dữ liệu ngay lần đầu tiên

  setInterval(() => {
    getWeatherData(io); // Cập nhật dữ liệu sau mỗi khoảng thời gian
  }, interval);
}

module.exports = { 
  getWeatherData,
  startWeatherUpdates,
};