const path = require("path");
const {io, express,app, server}= require('./func/server')

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());   

var port = 8500;
server.listen(port, () => {
  console.log(`Server đang chạy trên cổng: ${port}`);
});


app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


// Nhận data sensor từ ESP32
const { handleSensorData } = require('./func/handler');
app.post("/sensor", (req, res) => {
  handleSensorData(req, res, io);
});


// Cấu hình CORS
const cors = require('cors');
app.use(cors({
  origin: 'http://192.168.106.11:8500', 
}));
//get data from db
const { getSensorData } = require('./func/getSensorData');
app.get('/api/sensors', getSensorData);


//call API data thời tiết
const { startWeatherUpdates } = require('./func/weather');
startWeatherUpdates(io, 5000);


// lấy dữ liệu mới nhất từ MongoDB
const {getLatestSensorData}=require('./func/getNhietdodoam');
app.get("/sensor/latest",getLatestSensorData)


//pub from camera
const {mqttClient}= require('./func/mqtt')
const {handleMqttMessage}= require('./func/camera')
mqttClient.on('message', handleMqttMessage);



//handle yêu cầu assistant
const { handleOn_LED_khach,
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
  handleEndTimePost}= require('./func/handlerAssisstant')
app.post("/time", handleTimePost);
app.post("/endtime", handleEndTimePost);

app.get("/onled_khach", handleOn_LED_khach);
app.get("/onled_ngu", handleOn_LED_ngu);
app.get("/onled_bep", handleOn_LED_bep);
app.get("/onled_gara", handleOn_LED_gara);
app.get("/offled_khach", handleOff_LED_khach);
app.get("/offled_ngu", handleOff_LED_ngu);
app.get("/offled_bep", handleOff_LED_bep);
app.get("/offled_gara", handleOff_LED_gara);
app.get("/onfan", handleOn_fan);
app.get("/closefan", handleOff_fan);
app.get("/openservo", handleOn_Rem);
app.get("/closeservo",  handleOff_Rem);


//handle controldevice
const{handleControlDevice}=require('./func/handlerControlDevice');
const{handleSetTimeOn_Led, handleSetTimeOff_Led,
  handleSetTimeOn_fan, handleSetTimeOff_fan,
  handleSetTimeOn_Rem, handleSetTimeOff_Rem}=require('./func/handlerSettime')
function handleSocketEvents(socket, mqttClient) {
  handleControlDevice(socket, mqttClient);
  handleSetTimeOn_Led(socket, mqttClient);
  handleSetTimeOff_Led(socket, mqttClient);
  handleSetTimeOn_fan(socket, mqttClient);
  handleSetTimeOff_fan(socket, mqttClient);
  handleSetTimeOn_Rem(socket, mqttClient);
  handleSetTimeOff_Rem(socket, mqttClient);

  socket.on('disconnect', () => {
    console.log('Client đã ngắt kết nối:', socket.id);
  });
}

io.on('connection', (socket) => {
  handleSocketEvents(socket, mqttClient);
});



app.get("/", function (req, res) {
  console.log("Route '/' đã được gọi");
  res.render("index");
});