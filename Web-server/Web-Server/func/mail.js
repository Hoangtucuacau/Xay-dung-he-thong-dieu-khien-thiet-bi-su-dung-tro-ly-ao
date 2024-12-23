const nodemailer = require('nodemailer');

// Thiết lập máy chủ SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
      user: 'buihoangngoc20@gmail.com', 
      pass: 'qknxamkhgxdwgnnx'   
  }
});

let canSendEmail = true; 

function sendAlertEmail(name) {
  const mailOptions = {
      from: 'Admin System',
      to: 'buihoangngoc20@gmail.com',
      subject: 'Cảnh báo: Nhận dạng không hợp lệ',
      text: `Phát hiện một người không xác định: ${name}. Vui lòng kiểm tra hệ thống ngay lập tức.`
  };

  transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
          console.error('Lỗi khi gửi email:', error);
      } else {
          console.log('Email đã được gửi:', info.response);
      }
  });
}

module.exports = { sendAlertEmail, canSendEmail, setCanSendEmail };

function setCanSendEmail(value) {
  canSendEmail = value;
}
