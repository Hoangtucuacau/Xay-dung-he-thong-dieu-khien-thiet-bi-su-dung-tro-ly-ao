const{mqttClient}= require('./mqtt')
// Hàm xử lý gửi lệnh MQTT
const handleMqttCommand = (topic, message, res, successMessage) => {
    mqttClient.publish(topic, message, (err) => {
      if (err) {
        console.error("Lỗi khi gửi lệnh MQTT:", err);
        return res.status(500).send("Lỗi khi gửi lệnh MQTT");
      }
  
      console.log(`Đã gửi lệnh MQTT: ${message}`);
      res.status(200).send(successMessage);
    });
  };
  
  // Hàm bật LED phòng khách
  const handleOn_LED_khach = (req, res) => {
    const topic = "remoteLed_1";
    const message = "on";
    const successMessage = "Đèn phòng khách đã bật thành công thông qua MQTT!";
    handleMqttCommand(topic, message, res, successMessage);
  };
  
  const handleOff_LED_khach = (req, res) => {
    const topic = "remoteLed_1";
    const message = "off";
    const successMessage = "Đèn phòng khách đã tắt thành công thông qua MQTT!";
    handleMqttCommand(topic, message, res, successMessage);
  };

  // Hàm bật LED phòng ngủ
  const handleOn_LED_ngu = (req, res) => {
    const topic = "remoteLed_2";
    const message = "on";
    const successMessage = "Đèn phòng ngủ đã bật thành công thông qua MQTT!";
    handleMqttCommand(topic, message, res, successMessage);
  };
  
  const handleOff_LED_ngu = (req, res) => {
    const topic = "remoteLed_2";
    const message = "off";
    const successMessage = "Đèn phòng ngủ đã tắt thành công thông qua MQTT!";
    handleMqttCommand(topic, message, res, successMessage);
  };

   // Hàm bật LED phòng bếp
   const handleOn_LED_bep = (req, res) => {
    const topic = "remoteLed_3";
    const message = "on";
    const successMessage = "Đèn phòng bếp đã bật thành công thông qua MQTT!";
    handleMqttCommand(topic, message, res, successMessage);
  };
  
  const handleOff_LED_bep = (req, res) => {
    const topic = "remoteLed_3";
    const message = "off";
    const successMessage = "Đèn phòng bếp đã tắt thành công thông qua MQTT!";
    handleMqttCommand(topic, message, res, successMessage);
  };

  // Hàm bật LED gara
  const handleOn_LED_gara = (req, res) => {
      const topic = "remoteLed_4";
      const message = "on";
      const successMessage = "Đèn ở gara đã bật thành công thông qua MQTT!";
      handleMqttCommand(topic, message, res, successMessage);
    };
    
  const handleOff_LED_gara = (req, res) => {
      const topic = "remoteLed_4";
      const message = "off";
      const successMessage = "Đèn ở gara đã tắt thành công thông qua MQTT!";
      handleMqttCommand(topic, message, res, successMessage);
    };

   // Hàm bật quạt
   const handleOn_fan = (req, res) => {
    const topic = "remote_fan";
    const message = "on";
    const successMessage = "Quạt đã bật thành công thông qua MQTT!";
    handleMqttCommand(topic, message, res, successMessage);
  };
  
  const handleOff_fan = (req, res) => {
    const topic = "remote_fan";
    const message = "off";
    const successMessage = "Quạt đã tắt thành công thông qua MQTT!";
    handleMqttCommand(topic, message, res, successMessage);
  };

 // Hàm mở rèm
  const handleOn_Rem = (req, res) => {
      const topic = "remote_Rem";
      const message = "on";
      const successMessage = "Đèn ở gara đã bật thành công thông qua MQTT!";
      handleMqttCommand(topic, message, res, successMessage);
    };
    
  const handleOff_Rem = (req, res) => {
      const topic = "remote_Rem";
      const message = "off";
      const successMessage = "Đèn ở gara đã tắt thành công thông qua MQTT!";
      handleMqttCommand(topic, message, res, successMessage);
    };




//Hàm set bật
const handleTimePost = async (req, res) => {
  const { time } = req.body; 

  if (time !== undefined) { 
    try {
      console.log(`Đã nhận được dữ liệu thời gian: ${time} giây.`);

      setTimeout(() => {
        const ledTopic = "turnonled"; 
        const ledMessage = 'on';

        mqttClient.publish(ledTopic, ledMessage, (err) => {
          if (err) {
            console.error("Lỗi khi gửi lệnh MQTT bật LED:", err);
          } else {
            console.log(`Đã bật đèn LED sau ${time} giây.`);
          }
        });
      }, time * 1000); 

      res.status(200).send("Yêu cầu đã được xử lý thành công."); 

    } catch (error) {
      console.error("Thời gian chưa đúng", error);
      res.status(500).send("Lỗi khi lưu dữ liệu");
    }
  } else {
    res.status(400).send("Dữ liệu không hợp lệ");
  }
};

//Hàm set tắt
const handleEndTimePost = async (req, res) => {
  const { time } = req.body;

  if (time !== undefined) {
    try {
      console.log(`Đã nhận được dữ liệu thời gian: ${time} giây.`);
      
      setTimeout(() => {
        const ledTopic = "turnonled"; 
        const ledMessage = 'off';

        mqttClient.publish(ledTopic, ledMessage, (err) => {
          if (err) {
            console.error("Lỗi khi gửi lệnh MQTT tắt LED:", err);
          } else {
            console.log(`Đã tắt đèn LED sau ${time} giây.`);
          }
        });
      }, time * 1000); 
      
      res.status(200).send("Yêu cầu đã được xử lý thành công."); 

    } catch (error) {
      console.error("Thời gian chưa đúng", error);
      res.status(500).send("Lỗi khi lưu dữ liệu");
    }
  } else {
    res.status(400).send("Dữ liệu không hợp lệ");
  }
};

module.exports = { 
  handleOn_LED_khach,
  handleOff_LED_khach,
  handleOn_LED_ngu,
  handleOff_LED_ngu,
  handleOn_LED_bep,
  handleOff_LED_bep,
  handleOn_LED_gara,
  handleOff_LED_gara,
  handleOn_fan,
  handleOff_fan,
  handleOn_Rem,
  handleOff_Rem,
  handleTimePost,
  handleEndTimePost
 };  