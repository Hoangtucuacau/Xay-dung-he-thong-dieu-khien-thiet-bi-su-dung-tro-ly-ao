// Hàm xử lý sự kiện 'set-time'
function handleSetTimeOn_Led(socket, mqttClient) {
  socket.on('set-time-on-Led', ({ time }) => {
    console.log(`Đã nhận được lệnh 'set-time' với thời gian: ${time} giây.`);
    if (typeof time !== 'number' || time <= 0) {
      console.error("Thời gian không hợp lệ");
      return socket.emit('error', 'Thời gian không hợp lệ');
    }

    setTimeout(() => {
      let ledTopic = "turnonled";
      let ledMessage = 'on';

      mqttClient.publish(ledTopic, ledMessage, (err) => {
        if (err) {
          console.error("Lỗi khi gửi lệnh MQTT bật LED:", err);
          return socket.emit('error', 'Lỗi khi gửi lệnh bật LED qua MQTT');
        }

        console.log(`Đã bật đèn LED sau ${time} giây.`);
        socket.emit('success', `Đèn LED đã được bật sau ${time} giây.`);
      });
    }, time * 1000);
  });
}

// Hàm xử lý sự kiện 'set-time-off'
function handleSetTimeOff_Led(socket, mqttClient) {
  socket.on('set-time-off-Led', ({ time }) => {
    if (typeof time !== 'number' || time <= 0) {
      console.error("Thời gian không hợp lệ");
      return socket.emit('error', 'Thời gian không hợp lệ');
    }

    setTimeout(() => {
      let ledTopic = "turnonled";
      let ledMessage = 'off';

      mqttClient.publish(ledTopic, ledMessage, (err) => {
        if (err) {
          console.error("Lỗi khi gửi lệnh MQTT tắt LED:", err);
          return socket.emit('error', 'Lỗi khi gửi lệnh tắt LED qua MQTT');
        }

        console.log(`Đã tắt đèn LED sau ${time} giây.`);
        socket.emit('success', `Đèn LED đã được tắt sau ${time} giây.`);
      });
    }, time * 1000);
  });
}

// Hàm xử lý sự kiện 'set-time'
function handleSetTimeOn_fan(socket, mqttClient) {
  socket.on('set-time-on-fan', ({ time }) => {
    console.log(`Đã nhận được lệnh 'set-time' với thời gian: ${time} giây.`);
    if (typeof time !== 'number' || time <= 0) {
      console.error("Thời gian không hợp lệ");
      return socket.emit('error', 'Thời gian không hợp lệ');
    }

    setTimeout(() => {
      let ledTopic = "turnonled";
      let ledMessage = 'on';

      mqttClient.publish(ledTopic, ledMessage, (err) => {
        if (err) {
          console.error("Lỗi khi gửi lệnh MQTT bật LED:", err);
          return socket.emit('error', 'Lỗi khi gửi lệnh bật LED qua MQTT');
        }

        console.log(`Đã bật đèn LED sau ${time} giây.`);
        socket.emit('success', `Đèn LED đã được bật sau ${time} giây.`);
      });
    }, time * 1000);
  });
}

// Hàm xử lý sự kiện 'set-time-off'
function handleSetTimeOff_fan(socket, mqttClient) {
  socket.on('set-time-off-fan', ({ time }) => {
    if (typeof time !== 'number' || time <= 0) {
      console.error("Thời gian không hợp lệ");
      return socket.emit('error', 'Thời gian không hợp lệ');
    }

    setTimeout(() => {
      let ledTopic = "turnonled";
      let ledMessage = 'off';

      mqttClient.publish(ledTopic, ledMessage, (err) => {
        if (err) {
          console.error("Lỗi khi gửi lệnh MQTT tắt LED:", err);
          return socket.emit('error', 'Lỗi khi gửi lệnh tắt LED qua MQTT');
        }

        console.log(`Đã tắt đèn LED sau ${time} giây.`);
        socket.emit('success', `Đèn LED đã được tắt sau ${time} giây.`);
      });
    }, time * 1000);
  });
}


// Hàm xử lý sự kiện 'set-time'
function handleSetTimeOn_Rem(socket, mqttClient) {
  socket.on('set-time-on-Rem', ({ time }) => {
    console.log(`Đã nhận được lệnh 'set-time' với thời gian: ${time} giây.`);
    if (typeof time !== 'number' || time <= 0) {
      console.error("Thời gian không hợp lệ");
      return socket.emit('error', 'Thời gian không hợp lệ');
    }

    setTimeout(() => {
      let ledTopic = "turnonled";
      let ledMessage = 'on';

      mqttClient.publish(ledTopic, ledMessage, (err) => {
        if (err) {
          console.error("Lỗi khi gửi lệnh MQTT bật LED:", err);
          return socket.emit('error', 'Lỗi khi gửi lệnh bật LED qua MQTT');
        }

        console.log(`Đã bật đèn LED sau ${time} giây.`);
        socket.emit('success', `Đèn LED đã được bật sau ${time} giây.`);
      });
    }, time * 1000);
  });
}

// Hàm xử lý sự kiện 'set-time-off'
function handleSetTimeOff_Rem(socket, mqttClient) {
  socket.on('set-time-off-Rem', ({ time }) => {
    if (typeof time !== 'number' || time <= 0) {
      console.error("Thời gian không hợp lệ");
      return socket.emit('error', 'Thời gian không hợp lệ');
    }

    setTimeout(() => {
      let ledTopic = "turnonled";
      let ledMessage = 'off';

      mqttClient.publish(ledTopic, ledMessage, (err) => {
        if (err) {
          console.error("Lỗi khi gửi lệnh MQTT tắt LED:", err);
          return socket.emit('error', 'Lỗi khi gửi lệnh tắt LED qua MQTT');
        }

        console.log(`Đã tắt đèn LED sau ${time} giây.`);
        socket.emit('success', `Đèn LED đã được tắt sau ${time} giây.`);
      });
    }, time * 1000);
  });
}

module.exports = {
  handleSetTimeOn_Led, handleSetTimeOff_Led,
  handleSetTimeOn_fan, handleSetTimeOff_fan,
  handleSetTimeOn_Rem, handleSetTimeOff_Rem
};

