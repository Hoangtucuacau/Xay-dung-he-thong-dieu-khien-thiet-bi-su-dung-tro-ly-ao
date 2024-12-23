var socket = io();

const temperatureData = [];
const humidityData = [];
const lightData = []; 
const labels = [];
const powerData = [];  
const totalEnergyData = [];  

socket.on("temperature_io", function(temperature) {
  document.getElementById("sensor-temperature").innerText = temperature;
  temperatureGauge.value = parseFloat(temperature);
  temperatureGauge.update();
});

socket.on("humidity_io", function(humidity) {
  document.getElementById("sensor-humidity").innerText = humidity;
  humidityGauge.value = parseFloat(humidity);
  humidityGauge.update();
});

socket.on("light_io", function(light) {
  document.getElementById("sensor-light").innerText = light;
  lightGauge.value = parseFloat(light);
  lightGauge.update();
});

socket.on("voltage_io", function(voltage) {
document.getElementById("sensor-voltage").innerText = voltage + " V"; 
});

socket.on("current_io", function(current) {
document.getElementById("sensor-current").innerText = current + " mA";  
});

socket.on("power_io", function(power) {
document.getElementById("sensor-power").innerText = power + " mW"; 
});

socket.on("total_energy_io", function(totalEnergy) {
document.getElementById("sensor-total-energy").innerText = totalEnergy + " mWM"; 
updateChart(totalEnergy, 'totalEnergy'); 
});


socket.on("webcam_image", function(data_received) {
let base64Data = data_received.image; 
const img = document.getElementById("webcam-image");
const image = new Image();
image.src = "data:image/jpeg;base64," + base64Data;
image.onload = function() {
    const desiredWidth = 400;
    const desiredHeight = 300;
    img.width = desiredWidth;
    img.height = desiredHeight;
    img.src = image.src;
  };
});

socket.on("webcam_name", function(data_received) {
const name = data_received.name; 
const nameElement = document.getElementById("recognized-name"); 
nameElement.textContent = name; 
});

socket.on("webcam_status", function(data_received) {
const status = data_received.status; 
const statusElement = document.getElementById("recognition-status"); 
statusElement.textContent = status; 
});


socket.on("temperature_io_2", function(temperature) {
  document.getElementById("actual-temperature").innerText = temperature;
});

socket.on("humidity_io_2", function(humidity) {
  document.getElementById("actual-humidity").innerText = humidity;
});

function updateWeather(city, isSunny) {
  document.getElementById("city-name").innerText = "Thành phố: " + city;

  const weatherIcon = document.getElementById("weather-icon");
  if (isSunny) {
    weatherIcon.innerHTML = '<i class="icon sunny">☀️</i>'; 
  } else {
    weatherIcon.innerHTML = '<i class="icon cloudy">☁️</i>'; 
  }
}
updateWeather("Hà Nội", false);

socket.on("error", function(errorMessage) {
  console.error("Lỗi:", errorMessage);
  alert("Có lỗi xảy ra: " + errorMessage);
});

function updateTemperatureIcon(temperature) {
  const icon = document.getElementById("temperature-icon");
  icon.style.transform = temperature > 25 ? "scale(1.2)" : "scale(1)";
}

function updateHumidityIcon(humidity) {
  const icon = document.getElementById("humidity-icon");
  icon.style.transform = humidity > 60 ? "scale(1.2)" : "scale(1)";
}

function updateLightIcon(light) {
  const icon = document.getElementById("light-icon");
  icon.style.transform = light > 60 ? "scale(1.2)" : "scale(1)";
}

function updateChart(value, type) {
  const now = new Date();
  labels.push(now.toLocaleTimeString());
if (type === 'totalEnergy') {  
    totalEnergyData.push(value);
    if (totalEnergyData.length > 10) {
      totalEnergyData.shift();
      labels.shift();
    }
    energyChart.update();
  }
}

let energyChart;
function initCharts() {
  const ctxEnergy = document.getElementById('energyChart').getContext('2d');  

  const canvas = document.getElementById('energyChart');
  canvas.width = window.innerWidth * 0.3; 
  canvas.height = 300;

  energyChart = new Chart(ctxEnergy, {
    type: 'line',  
    data: {
      labels: labels,
      datasets: [{
        label: 'Điện năng tiêu thụ (mW)',
        data: totalEnergyData,
        borderColor: 'rgba(255, 99, 132, 1)',  
        backgroundColor: 'rgba(255, 99, 132, 0.2)',  
        fill: true, 
        borderWidth: 2
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

let temperatureGauge, humidityGauge;

function initGauges() {
  temperatureGauge = createTemperatureGauge();
  humidityGauge = createHumidityGauge();

  temperatureGauge.draw();
  humidityGauge.draw();
}

function createTemperatureGauge() {
  var gauge = new LinearGauge({
    renderTo: "gauge-temperature",
    width: 120,
    height: 200,
    units: "Temperature (°C)",
    minValue: 0,
    startAngle: 90,
    ticksAngle: 180,
    maxValue: 40,
    colorValueBoxRect: "#049faa",
    colorValueBoxRectEnd: "#049faa",
    colorValueBoxBackground: "#f1fbfc",
    valueDec: 2,
    valueInt: 2,
    majorTicks: ["0", "5", "10", "15", "20", "25", "30", "35", "40"],
    minorTicks: 4,
    strokeTicks: true,
    highlights: [
      {
        from: 30,
        to: 40,
        color: "rgba(200, 50, 50, .75)",
      },
    ],
    colorPlate: "#fff",
    colorBarProgress: "#CC2936",
    colorBarProgressEnd: "#049faa",
    borderShadowWidth: 0,
    borders: false,
    needleType: "arrow",
    needleWidth: 2,
    needleCircleSize: 7,
    needleCircleOuter: true,
    needleCircleInner: false,
    animationDuration: 1500,
    animationRule: "linear",
    barWidth: 10,
  });
  return gauge;
}

function createHumidityGauge() {
  var gauge = new RadialGauge({
    renderTo: "gauge-humidity",
    width: 200,
    height: 200,
    units: "Humidity (%)",
    minValue: 0,
    maxValue: 100,
    colorValueBoxRect: "#049faa",
    colorValueBoxRectEnd: "#049faa",
    colorValueBoxBackground: "#f1fbfc",
    valueInt: 2,
    majorTicks: ["0", "20", "40", "60", "80", "100"],
    minorTicks: 4,
    strokeTicks: true,
    highlights: [
      {
        from: 80,
        to: 100,
        color: "#03C0C1",
      },
    ],
    colorPlate: "#fff",
    borderShadowWidth: 0,
    borders: false,
    needleType: "line",
    colorNeedle: "#007F80",
    colorNeedleEnd: "#007F80",
    needleWidth: 2,
    needleCircleSize: 3,
    colorNeedleCircleOuter: "#007F80",
    needleCircleOuter: true,
    needleCircleInner: false,
    animationDuration: 1500,
    animationRule: "linear",
  });
  return gauge;
}

let lightGauge;

function initLightGauge() {
  lightGauge = createLightGauge();
  lightGauge.draw();
}

function createLightGauge() {
  var gauge = new RadialGauge({
    renderTo: "gauge-light",
    width: 200,
    height: 200,
    units: "Light Intensity (lux)",
    minValue: 0,
    maxValue: 1000,
    colorValueBoxRect: "#FFE700",
    colorValueBoxRectEnd: "#FFD700",
    colorValueBoxBackground: "#FFFACD",
    valueInt: 2,
    majorTicks: ["0", "200", "400", "600", "800", "1000"],
    minorTicks: 4,
    strokeTicks: true,
    highlights: [
      {
        from: 800,
        to: 1000,
        color: "rgba(255, 165, 0, .75)",
      },
    ],
    colorPlate: "#fff",
    borderShadowWidth: 0,
    borders: false,
    needleType: "line",
    colorNeedle: "#FFD700",
    colorNeedleEnd: "#FFA500",
    needleWidth: 2,
    needleCircleSize: 3,
    colorNeedleCircleOuter: "#FFA500",
    needleCircleOuter: true,
    needleCircleInner: false,
    animationDuration: 1500,
    animationRule: "linear",
  });
  return gauge;
}

let powerGauge;

function initPowerGauge() {
  powerGauge = createPowerGauge();
  powerGauge.draw();
}

function createPowerGauge() {
  var gauge = new RadialGauge({
    renderTo: "gauge-power",  
    width: 300,
    height: 150,  
    units: "Power (mW)",
    minValue: 0,
    maxValue: 10000,  
    colorValueBoxRect: "#049faa",
    colorValueBoxRectEnd: "#049faa",
    colorValueBoxBackground: "#f1fbfc",
    valueInt: 2,
    majorTicks: ["0", "2000", "4000", "6000", "8000", "10000"],
    minorTicks: 4,
    strokeTicks: true,
    highlights: [
      {
        from: 8000,
        to: 10000,
        color: "#FF0000",  
      },
    ],
    colorPlate: "#fff",
    borderShadowWidth: 0,
    borders: false,
    needleType: "line",
    colorNeedle: "#007F80",
    colorNeedleEnd: "#007F80",
    needleWidth: 2,
    needleCircleSize: 3,
    colorNeedleCircleOuter: "#007F80",
    needleCircleOuter: true,
    needleCircleInner: false,
    animationDuration: 1500,
    animationRule: "linear",

    angleStart: 180,  
    angleEnd: -180, 
  });
  return gauge;
}

window.onload = function() {
  initGauges();
  initLightGauge();
  initCharts();
  initPowerGauge()
};


// Gửi lệnh điều khiển thiết bị qua socket
function controlDevice(device, action) {
  socket.emit('control-device', { device: device, action: action });
}


function setTime_on_Led() {
const hours = parseInt(document.getElementById('set-hours-on-Led').value) || 0;
const minutes = parseInt(document.getElementById('set-minutes-on-Led').value) || 0;
const seconds = parseInt(document.getElementById('set-seconds-on-Led').value) || 0;

if (hours < 0 || minutes < 0 || seconds < 0) {
    alert('Vui lòng nhập thời gian hợp lệ');
    return;
}
const totalSeconds = (hours * 3600) + (minutes * 60) + seconds;
if (totalSeconds > 0) {
    socket.emit('set-time-on-Led', { time: totalSeconds });
} else {
    alert('Vui lòng nhập thời gian lớn hơn 0 giây');
}
}

function setTime_off_Led() {
const hours = parseInt(document.getElementById('set-hours-off-Led').value) || 0;
const minutes = parseInt(document.getElementById('set-minutes-off-Led').value) || 0;
const seconds = parseInt(document.getElementById('set-seconds-off-Led').value) || 0;

if (hours < 0 || minutes < 0 || seconds < 0) {
    alert('Vui lòng nhập thời gian hợp lệ');
    return;
}
const totalSeconds = (hours * 3600) + (minutes * 60) + seconds;
if (totalSeconds > 0) {
    socket.emit('set-time-off-Led', { time: totalSeconds });
} else {
    alert('Vui lòng nhập thời gian lớn hơn 0 giây');
}
}

function setTime_on_fan() {
  const hours = parseInt(document.getElementById('set-hours-on-fan').value) || 0;
  const minutes = parseInt(document.getElementById('set-minutes-on-fan').value) || 0;
  const seconds = parseInt(document.getElementById('set-seconds-on-fan').value) || 0;
  
  if (hours < 0 || minutes < 0 || seconds < 0) {
      alert('Vui lòng nhập thời gian hợp lệ');
      return;
  }
  const totalSeconds = (hours * 3600) + (minutes * 60) + seconds;
  if (totalSeconds > 0) {
      socket.emit('set-time-on-fan', { time: totalSeconds });
  } else {
      alert('Vui lòng nhập thời gian lớn hơn 0 giây');
  }
  }
  
  function setTime_off_fan() {
  const hours = parseInt(document.getElementById('set-hours-off-fan').value) || 0;
  const minutes = parseInt(document.getElementById('set-minutes-off-fan').value) || 0;
  const seconds = parseInt(document.getElementById('set-seconds-off-fan').value) || 0;
  
  if (hours < 0 || minutes < 0 || seconds < 0) {
      alert('Vui lòng nhập thời gian hợp lệ');
      return;
  }
  const totalSeconds = (hours * 3600) + (minutes * 60) + seconds;
  if (totalSeconds > 0) {
      socket.emit('set-time-off-fan', { time: totalSeconds });
  } else {
      alert('Vui lòng nhập thời gian lớn hơn 0 giây');
  }
  }

  function setTime_on_Rem() {
    const hours = parseInt(document.getElementById('set-hours-on-Rem').value) || 0;
    const minutes = parseInt(document.getElementById('set-minutes-on-Rem').value) || 0;
    const seconds = parseInt(document.getElementById('set-seconds-on-Rem').value) || 0;
    
    if (hours < 0 || minutes < 0 || seconds < 0) {
        alert('Vui lòng nhập thời gian hợp lệ');
        return;
    }
    const totalSeconds = (hours * 3600) + (minutes * 60) + seconds;
    if (totalSeconds > 0) {
        socket.emit('set-time-on-Rem', { time: totalSeconds });
    } else {
        alert('Vui lòng nhập thời gian lớn hơn 0 giây');
    }
    }
    
    function setTime_off_Rem() {
    const hours = parseInt(document.getElementById('set-hours-off-Rem').value) || 0;
    const minutes = parseInt(document.getElementById('set-minutes-off-Rem').value) || 0;
    const seconds = parseInt(document.getElementById('set-seconds-off-Rem').value) || 0;
    
    if (hours < 0 || minutes < 0 || seconds < 0) {
        alert('Vui lòng nhập thời gian hợp lệ');
        return;
    }
    const totalSeconds = (hours * 3600) + (minutes * 60) + seconds;
    if (totalSeconds > 0) {
        socket.emit('set-time-off-Rem', { time: totalSeconds });
    } else {
        alert('Vui lòng nhập thời gian lớn hơn 0 giây');
    }
    }

setInterval(function() {
  var currentTime = new Date().toLocaleString();
  document.getElementById("current-time").innerText = currentTime;
}, 1000);