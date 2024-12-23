const { sendAlertEmail, canSendEmail, setCanSendEmail }= require('./mail')
const { time } = require("console");
const { mqttClient } = require('./mqtt')
const{io}= require('./server')

mqttClient.on('connect', () => {
    console.log('Đã kết nối đến MQTT broker');
  
    mqttClient.subscribe('pub/camera', (err) => {
      if (err) {
        console.error('Lỗi khi đăng ký topic pub/camera:', err);
      } else {
        console.log('Đã đăng ký topic pub/camera');
      }
    });
});

// Hàm xử lý dữ liệu khi nhận được tin nhắn từ MQTT
function handleMqttMessage(topic, message) {
  if (topic === 'pub/camera') {
      // Chuyển đổi dữ liệu từ message thành chuỗi
      const jsonData = message.toString();

      try {
          const webcamData = JSON.parse(jsonData);
          const imageData = webcamData.image; // Dữ liệu hình ảnh base64
          const name = webcamData.name; // Tên người nhận dạng

          let status;
          if (name === "unknown") {
            status = "Cảnh báo";

            if (canSendEmail) {
                sendAlertEmail(name); // Gửi email
                canSendEmail = false; // Khóa gửi email trong 10 giây

                // Mở lại quyền gửi email sau 10 giây
                setTimeout(() => {
                    canSendEmail = true;
                }, 10000);
            }
          } else {
            status = "Hợp lệ";
          }

          // Phát sóng dữ liệu hình ảnh đến tất cả các client thông qua Socket.IO
          io.emit('webcam_image', webcamData);
          console.log('Đã phát sóng dữ liệu hình ảnh đến client');

          // Phát sóng tên đến tất cả các client thông qua Socket.IO
          io.emit('webcam_name', { name: name });
          console.log('Đã phát sóng tên đến client:', name);

          // Phát sóng trạng thái đến tất cả các client thông qua Socket.IO
          io.emit('webcam_status', { status: status });
          console.log('Đã phát sóng trạng thái đến client, trạng thái:', status);
      } catch (error) {
          console.error('Lỗi khi phân tích cú pháp dữ liệu:', error);
      }
  }
}
module.exports ={handleMqttMessage};