// function handleControlDevice(socket, mqttClient) {
//     socket.on('control-device', ({ device, action }) => {
//       let topic = "";
//       let message = action;
  
//       if (device === 'temperature') {
//         topic = "control/temperature";
//       } else if (device === 'light') {
//         topic = "turnonled";
//       }
  
//       if (topic) {
//         mqttClient.publish(topic, message, (err) => {
//           if (err) {
//             console.error("Lỗi khi gửi lệnh MQTT:", err);
//             return socket.emit('error', 'Lỗi khi gửi lệnh điều khiển qua MQTT');
//           }
  
//           console.log(`Đã gửi lệnh MQTT cho ${device}: ${message}`);
//           socket.emit('success', `Đã điều khiển thiết bị ${device} ${message}`);
//         });
//       } else {
//         console.error("Thiết bị không hợp lệ");
//         socket.emit('error', 'Thiết bị không hợp lệ');
//       }
//     });
//   }
  
//   module.exports = {handleControlDevice};


// function handleControlDevice(socket, mqttClient) {
//   socket.on('control-device', ({ device, action }) => {
//     let topic = "";
//     let message = action;

//     if (device === 'fan') {
//       topic = "control/fan";
//     } else if (device === 'light_khach') {
//       topic = "control/light_khach";
//     }else if (device === 'light_ngu') {
//       topic = "control/light_ngu";
//     }else if (device === 'light_bep') {
//       topic = "control/light_bep";
//     }else if (device === 'light_gara') {
//       topic = "control/light_gara";
//     }else if (device === 'buzzer'){
//       topic = "control/buzzer";
//     }else if (device === 'Rem') {
//       topic = "control/Rem";
//     }

//     if (topic) {
//       mqttClient.publish(topic, message, (err) => {
//         if (err) {
//           console.error("Lỗi khi gửi lệnh MQTT:", err);
//           return socket.emit('error', 'Lỗi khi gửi lệnh điều khiển qua MQTT');
//         }

//         console.log(`Đã gửi lệnh MQTT cho ${device}: ${message}`);
//         socket.emit('success', `Đã điều khiển thiết bị ${device} ${message}`);
//       });
//     } else {
//       console.error("Thiết bị không hợp lệ");
//       socket.emit('error', 'Thiết bị không hợp lệ');
//     }
//   });
// }

// module.exports = {handleControlDevice};

function handleControlDevice(socket, mqttClient) {
  socket.on('control-device', ({ device, action }) => {
    console.log("Received device:", device); // Log giá trị device nhận được
    let topic = "";
    let message = action;

    if (device === 'fan') {
      topic = "remote_fan";
    } else if (device === 'light_khach') {
      topic = "remoteLed_1";
    } else if (device === 'light_ngu') {
      topic = "remoteLed_2";
    } else if (device === 'light_bep') {
      topic = "remoteLed_3";
    } else if (device === 'light_gara') {
      topic = "remoteLed_4";
    } else if (device === 'buzzer') {
      topic = "remote_buzzer";
    } else if (device === 'Rem') {
      topic = "remote_Rem";
    }

    if (topic) {
      mqttClient.publish(topic, message, (err) => {
        if (err) {
          console.error("Lỗi khi gửi lệnh MQTT:", err);
          return socket.emit('error', 'Lỗi khi gửi lệnh điều khiển qua MQTT');
        }

        console.log(`Đã gửi lệnh MQTT cho ${device}: ${message}`);
        socket.emit('success', `Đã điều khiển thiết bị ${device} ${message}`);
      });
    } else {
      console.error("Thiết bị không hợp lệ");
      socket.emit('error', 'Thiết bị không hợp lệ');
    }
  });
}
module.exports = {handleControlDevice};

