
//HandlerSensorData
const { SensorData } = require('./db');
const handleSensorData = async (req, res, io) => {
  const { temperature, humidity, light, voltage, current, power, totalEnergy } = req.body;

  if (
    temperature !== undefined &&
    humidity !== undefined &&
    light !== undefined &&
    voltage !== undefined &&
    current !== undefined &&
    power !== undefined &&
    totalEnergy !== undefined
  ) {
    try {
      const currentUTCDate = new Date();
      currentUTCDate.setHours(currentUTCDate.getHours());

      const newData = {
        temperature: parseFloat(temperature),
        humidity: parseFloat(humidity),
        light: parseInt(light),
        voltage: parseFloat(voltage),
        current: parseFloat(current),
        power: parseFloat(power),
        totalEnergy: parseFloat(totalEnergy),
        timestamp: currentUTCDate.toISOString(),
        source: 'sensor'
      };

      const sensorData = new SensorData(newData);
      await sensorData.save(); 

      console.log('Đã lưu dữ liệu từ sensor vào MongoDB - Temperature:', newData.temperature, 'Humidity:', newData.humidity, 'Light Level:', newData.light, 'Voltage:', newData.voltage, 'Current:', newData.current, 'Power:', newData.power, 'Total Energy:', newData.totalEnergy);

      io.emit('temperature_io', newData.temperature.toFixed(2));
      io.emit('humidity_io', newData.humidity.toFixed(2));
      io.emit('light_io', newData.light);
      io.emit('voltage_io', newData.voltage.toFixed(2));
      io.emit('current_io', newData.current.toFixed(2));
      io.emit('power_io', newData.power.toFixed(2));
      io.emit('total_energy_io', newData.totalEnergy.toFixed(2));

      res.status(200).send('Dữ liệu đã được lưu');
    } catch (error) {
      console.error('Lỗi khi lưu dữ liệu vào MongoDB:', error);
      res.status(500).send('Lỗi khi lưu dữ liệu');
    }
  } else {
    res.status(400).send('Dữ liệu không hợp lệ');
  }
};
module.exports = { handleSensorData };


