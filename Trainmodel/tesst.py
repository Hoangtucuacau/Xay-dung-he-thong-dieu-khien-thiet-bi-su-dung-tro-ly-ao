import speech_recognition as sr
import time
import wikipedia
import requests
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from webdriver_manager.chrome import ChromeDriverManager
from time import strftime
import pyttsx3
from model import model_recognize_voice

from youtube_search import YoutubeSearch
import webbrowser
import urllib
import urllib.request as urllib2
import requests
import paho.mqtt.client as mqtt
import mysql.connector
import random
import threading
import json
import re
import datetime
from datetime import datetime, timedelta

import pygame
import playsound
from gtts import gTTS
import os

model = model_recognize_voice()
wikipedia.set_lang('vi')
language = 'vi'
path = ChromeDriverManager().install()

def speak(text):
    print("Bot: {}".format(text))
    pygame.mixer.init()

    # Convert text to speech using gTTS
    tts = gTTS(text=text, lang='vi', slow=False)
    tts.save("sound.mp3")
    
    # Load and play the sound
    pygame.mixer.music.load("sound.mp3")
    pygame.mixer.music.play()

    # Wait for the sound to finish playing
    while pygame.mixer.music.get_busy():
        pygame.time.Clock().tick(10)

    pygame.mixer.quit()
    os.remove("sound.mp3")
        
# def get_audio():
#      r = sr.Recognizer()
#      with sr.Microphone() as source:
#         print("Me: ", end = '')
#         audio = r.listen(source, phrase_time_limit=5)
#         try:
#             text = r.recognize_google(audio, language="vi-VN")
#             print(text)
#             return text
#         except:
#             print("...")
#             return 0

# def get_text():
#     for i in range(3):
#         text = get_audio()
#         if text:
#             return text.lower()
#         elif i < 2:
#             speak("Bot không nghe rõ, bạn có thể nói lại không ?")
#     time.sleep(10)
#     stop()
#     return 0

def get_text():
    for i in range(3):
        text = input("Bạn: ")
        if text.strip(): 
            return text.lower()
        elif i < 2:
            print("Bot không nghe rõ, bạn có thể nhập lại không?")
    print("Hết thời gian chờ. Dừng chương trình.")
    return 0


def asistant_recognize():
    speak("Mình đây mình giúp gì được cho bạn?")
    text = get_text()
    result = model.predict(text)
    
    if result == "noanswer":
        speak("Thông tin này tôi chưa biết, tôi đang học")
    elif result=="bật đèn":
        bat_den()
    elif result=="tắt đèn":
        tat_den()
    elif result=="bật quạt":
        bat_quat()
    elif result=="tắt quạt":
        tat_quat()
    elif result=="mở rèm":
        mo_rem()
    elif result=="đóng rèm":
        dong_rem()
    elif result=="đi vắng":
        di_vang()
    elif result=="về nhà":
        ve_nha()
    elif result=="hỏi giờ ngày":
        hoi_gio_ngay()
    elif result=="hỏi thời tiết":
        hoi_thoi_tiet()
    elif result=="nhắc nhở":
        nhac_nho()
    elif result=="mở nhạc":
        mo_nhac()
    elif result=="hỏi nhiệt độ phòng":
        hoi_nhiet_do_phong()
    # else:
    #     speak("Mình chưa nhận dạng được")



def extract_time(text):
    hours = minutes = seconds = 0
    match_hours = re.search(r"(\d+)\s*(giờ|tiếng)", text)
    if match_hours:
        hours = int(match_hours.group(1))
    match_minutes = re.search(r"(\d+)\s*phút", text)
    if match_minutes:
        minutes = int(match_minutes.group(1))
    match_seconds = re.search(r"(\d+)\s*giây", text)
    if match_seconds:
        seconds = int(match_seconds.group(1))
    total_seconds = hours * 3600 + minutes * 60 + seconds
    return total_seconds

def control_led_on(text):
    try:
        total_seconds = extract_time(text)
        if total_seconds > 0:
            payload = {'time': total_seconds}
            response = requests.post("http://192.168.106.11:8500/endtime", json=payload)
            speak(f"Đèn trắng sẽ bật sau {total_seconds} giây")
            time.sleep(total_seconds)  
            if response.status_code == 200:
                speak("Đèn trắng đã được bật")
        else:
            speak("Không thể bật đèn trắng, đã xảy ra lỗi.")
    except Exception as e:
        speak(f"Lỗi: {e}")

def control_led_off(text):
    try:
        total_seconds = extract_time(text)
        if total_seconds > 0:
            payload = {'time': total_seconds}
            response = requests.post("http://192.168.106.11:8500/endtime", json=payload)
            speak(f"Đèn trắng sẽ tắt sau {total_seconds} giây")
            time.sleep(total_seconds)  
            if response.status_code == 200:
                speak("Đèn trắng đã được tắt")
        else:
            speak("Không thể tắt đèn trắng, đã xảy ra lỗi.")
    except Exception as e:
        speak(f"Lỗi: {e}")

# Thông tin đăng nhập cho MQTT
mqtt_broker = "mqttvcloud.innoway.vn"
mqtt_username = "cde"  
mqtt_password = "jp4jfwJHNXaql5gJ9xZzF8PNJm7oZ2ND" 
mqtt_control_topic = "camera/control" 
mqtt_recognition_topic = "recognition"

# Khởi tạo client MQTT
client = mqtt.Client()

# Biến để theo dõi trạng thái chế độ vắng nhà và cảnh báo
vacation_mode = False
alert_active = False
alert_thread = None 
vacation_mode_lock = threading.Lock()

def on_connect(client, userdata, flags, rc):
    if rc == 0:
        client.subscribe(mqtt_control_topic)  
        client.subscribe(mqtt_recognition_topic)  
    else:
        speak(f"Có lỗi khi kết nối: Mã lỗi {rc}")

def alert_loop():
    while alert_active:
        speak("Có người lạ đột nhập!")
        time.sleep(3)  

def on_message(client, userdata, msg):
    global alert_active, alert_thread, vacation_mode
    message = msg.payload.decode("utf-8")

    with vacation_mode_lock:
        if vacation_mode:  # Chỉ thực hiện nếu chế độ vắng nhà đang bật
            if message == "2":
                if not alert_active:
                    alert_active = True
                    alert_thread = threading.Thread(target=alert_loop)
                    alert_thread.start()
            elif message == "3":
                if alert_active:
                    alert_active = False
                    alert_thread.join()  # Đợi cho luồng cảnh báo hoàn thành
                    speak("Chấm dứt cảnh báo.")    

def mqtt_connect():
    client.username_pw_set(mqtt_username, mqtt_password) 
    client.on_connect = on_connect  
    client.on_message = on_message  
    try:
        client.connect(mqtt_broker)
        client.loop_forever() 
    except Exception as e:
        speak("Có lỗi")

def mqtt_publish(message):
    try:
        client.publish(mqtt_control_topic, message)
    except Exception as e:
        speak("có lỗi")

def camera_on():
    global vacation_mode
    with vacation_mode_lock:
        vacation_mode = True  
        mqtt_publish("1")
        speak("Chế độ vắng nhà đã được bật.")

def camera_off():
    global alert_active, alert_thread, vacation_mode
    with vacation_mode_lock:
        vacation_mode = False 
        mqtt_publish("0")
        alert_active = False  
        if alert_thread and alert_thread.is_alive():
            alert_thread.join() 
            speak("Chế độ vắng nhà đã được tắt.")   

def on_all():
    requests.get("http://192.168.106.11:8500/onwhite")
    requests.get("http://192.168.106.11:8500/onfan")
    requests.get("http://192.168.106.11:8500/close")
    camera_off()

def off_all():
    requests.get("http://192.168.106.11:8500/offwhite")
    requests.get("http://192.168.106.11:8500/closefan")
    requests.get("http://192.168.106.11:8500/close")
    camera_on() 

def bat_den():
    speak("Bạn muốn bật đèn ở đâu ạ")
    text=get_text()
    if "phòng khách" in text:
        requests.get("http://192.168.106.11:8500/onled_khach")
        speak("Đèn phòng khách đã được bật")
    elif "phòng ngủ" in text:
        requests.get("http://192.168.106.11:8500/onled_ngu")
        speak("Đèn phòng ngủ đã được bật")
    elif "phòng bếp" in text:
        requests.get("http://192.168.106.11:8500/onled_bep")
        speak("Đèn phòng bếp đã được bật")  
    elif "gara" in text:
        requests.get("http://192.168.106.11:8500/onled_gara")
        speak("Đèn nhà xe đã được bật") 
    else:
        speak("Mình chưa hiểu")

def tat_den():
    speak("Bạn muốn tắt đèn ở đâu ạ")
    text=get_text()
    if "phòng khách" in text:
        requests.get("http://192.168.106.11:8500/offled_khach")
        speak("Đèn phòng khách đã được tắt")
    elif "phòng ngủ" in text:
        requests.get("http://192.168.106.11:8500/offled_ngu")
        speak("Đèn phòng ngủ đã được tắt")
    elif "phòng bếp" in text:
        requests.get("http://192.168.106.11:8500/offled_bep")
        speak("Đèn phòng bếp đã được tắt")  
    elif "gara" in text:
        requests.get("http://192.168.106.11:8500/offled_gara")
        speak("Đèn nhà xe đã được tắt") 
    else:
        speak("Mình chưa hiểu")

def bat_quat():
    requests.get("http://192.168.106.11:8500/onfan")
    speak("Quạt đã được bật")

def tat_quat():
    requests.get("http://192.168.106.11:8500/closefan")
    speak("Quạt đã được tắt")

def mo_rem():
    requests.get("http://192.168.106.11:8500/openservo")
    speak("Rèm cửa đã được mở")

def dong_rem():
    requests.get("http://192.168.106.11:8500/closeservo")
    speak("Rèm cửa đã được đóng")

def di_vang():
    camera_on()
    speak("Đã rõ")

def ve_nha():
    camera_off()
    speak("Ok")

def hoi_gio_ngay(text):
    now = datetime.datetime.now()
    if "giờ" in text:
        speak('Bây giờ là %d giờ %d phút' % (now.hour, now.minute))
    elif "ngày" in text:
        speak("Hôm nay là ngày %d tháng %d năm %d" %
            (now.day, now.month, now.year))
    else:
        speak("Mình chưa hiểu ý của bạn. Bạn nói lại được không?")

def hoi_thoi_tiet():
    speak("Bạn muốn xem thời tiết ở đâu ạ!")
    time.sleep(3)
    url = "http://api.openweathermap.org/data/2.5/weather?"
    city = get_text()
    if not city:
        pass
    api_key = "fe8d8c65cf345889139d8e545f57819a"
    call_url = url + "appid=" + api_key + "&q=" + city + "&units=metric"
    response = requests.get(call_url)
    data = response.json()
    if data["cod"] != "404":
        city_res = data["main"]
        current_temp = city_res["temp"]
        current_pressure = city_res["pressure"]
        current_humidity = city_res["humidity"]
        sun_time  = data["sys"]
        sun_rise = datetime.fromtimestamp(sun_time["sunrise"])
        sun_set = datetime.fromtimestamp(sun_time["sunset"])
        wther = data["weather"]
        weather_des = wther[0]["description"]
        now = datetime.now()
        content = """
        Hôm nay là ngày {day} tháng {month} năm {year}
        Mặt trời mọc vào {hourrise} giờ {minrise} phút
        Mặt trời lặn vào {hourset} giờ {minset} phút
        Nhiệt độ trung bình là {temp} độ C
        Áp suất không khí là {pressure} héc tơ Pascal
        Độ ẩm là {humidity}%
        Trời hôm nay quang mây. Dự báo mưa rải rác ở một số nơi.""".format(day = now.day, month = now.month, year= now.year, hourrise = sun_rise.hour, minrise = sun_rise.minute,
                                                                           hourset = sun_set.hour, minset = sun_set.minute, 
                                                                           temp = current_temp, pressure = current_pressure, humidity = current_humidity)
        speak(content)
        time.sleep(25)
    else:
        speak("Không tìm thấy thành phố!")

def extract_reminder_time(text):
    # Kiểm tra xem có phải thời gian cụ thể không (ví dụ: "5 giờ 15 phút chiều", "17 giờ 15 phút")
    match = re.search(r'(\d{1,2})\s*giờ\s*(\d{1,2})\s*phút\s*(sáng|chiều|tối)?', text)
    if match:
        hour = int(match.group(1))
        minute = int(match.group(2))
        time_of_day = match.group(3)  # Có thể là None, sáng, chiều, tối
        
        # Nếu không có thông tin sáng/chieu/tối, xác định theo giờ
        if time_of_day is None:
            if hour < 12:  # Giả sử nếu giờ nhỏ hơn 12 thì đó là sáng
                time_of_day = "sáng"
            else:
                time_of_day = "chiều"  # Nếu không thì mặc định là chiều

        # Điều chỉnh giờ cho định dạng 12h thành 24h
        if time_of_day == "chiều" or time_of_day == "tối":
            if hour < 12:  # Chuyển 5 giờ chiều thành 17 giờ
                hour += 12
        elif time_of_day == "sáng" and hour == 12:  # Chuyển 12 giờ sáng thành 0 giờ
            hour = 0

        # Trả về thời gian còn lại từ hiện tại đến giờ nhắc nhở
        current_time = datetime.now()
        reminder_time = current_time.replace(hour=hour, minute=minute, second=0, microsecond=0)
        
        # Nếu giờ nhắc đã qua trong ngày, lên lịch cho ngày hôm sau
        if reminder_time < current_time:
            reminder_time += timedelta(days=1)

        time_diff = (reminder_time - current_time).total_seconds()
        print(f"Thời gian nhắc nhở: {reminder_time}, Thời gian còn lại: {time_diff} giây")
        return time_diff

    # Kiểm tra thời gian theo dạng "sau 5 giây", "sau 3 phút", v.v.
    match = re.search(r'sau (\d+)\s*(phút|giờ|giây)', text)
    if match:
        time_value = int(match.group(1))
        time_unit = match.group(2)
        
        if time_unit == 'phút':
            return time_value * 60  # chuyển phút thành giây
        elif time_unit == 'giờ':
            return time_value * 3600  # chuyển giờ thành giây
        elif time_unit == 'giây':
            return time_value
    return 0

def extract_reminder_message(text):
    match = re.search(r"nhắc tôi (.*)", text)
    if match:
        return match.group(1)  
    return None 


def schedule_reminder(reminder_time, reminder_message):
    if reminder_time <= 0:
        speak("Thời gian nhắc nhở không hợp lệ.")
        return

    current_time = datetime.now()
    reminder_time = current_time + timedelta(seconds=reminder_time)  
    speak("Mình đã lên lịch cho bạn")

    time_to_wait = (reminder_time - current_time).total_seconds()
    print(f"Chờ {time_to_wait} giây để nhắc nhở")

    if time_to_wait > 0:
        time.sleep(time_to_wait)  
        speak(f"Bạn có lời nhắc: {reminder_message}")

def nhac_nho(text):
    reminder_time = extract_reminder_time(text) 
    reminder_message = extract_reminder_message(text) 
    if reminder_message:
        schedule_reminder(reminder_time, reminder_message) 
    else:
        speak("Mình không hiểu")

def mo_nhac():
    speak("Xin mời bạn chọn bài hát")
    time.sleep(3)
    my_song = get_text()
    while True:
        result = YoutubeSearch(my_song, max_results = 10).to_dict()
        if result:
            break;
    url = 'https://www.youtube.com' + result[0]['url_suffix']
    webbrowser.open(url)
    speak("Bài hát của bạn đã được mở, hãy thưởng thức nó!")

def hoi_nhiet_do_phong():
    try:
        response = requests.get("http://192.168.106.11:8500/sensor/latest")
        if response.status_code == 200:
            data = response.json() 
            temperature = data['temperature']
            humidity = data['humidity']
            speak(f"Nhiệt độ hiện tại là {temperature} độ C, độ ẩm là {humidity} phần trăm.")
            return temperature, humidity
        else:
            return None, None
    except Exception as e:
        print(f"Lỗi khi lấy dữ liệu: {e}")
        return None, None


def stop():
    speak("Hẹn gặp lại bạn nhé")

def hello():
    day_time = int(strftime('%H'))
    if day_time < 12:
        speak("Chào buổi sáng. Chúc bạn một ngày tốt lành.")
    elif 12 <= day_time < 18:
        speak("Chào buổi chiều. Bạn đã dự định gì cho chiều nay chưa.")
    else:
        speak("Chào buổi tối. Bạn đã ăn tối chưa nhỉ.")

def open_google_and_search(text):
    speak('Okay!')
    driver = webdriver.Chrome(path)
    driver.get("https://www.google.com")
    que = driver.find_element_by_xpath("//input[@name='q']")
    que.send_keys(str(text))
    que.send_keys(Keys.RETURN)
    time.sleep(15)
    while True:
        speak("Bạn có muốn tiếp tục lướt web không?")
        text= get_text()
        if "có" in text or "ok" in text:
            time.sleep(20)
        else:
            driver.close()
            break

def tell_me_about():
    try:
        speak("Bạn muốn nghe về gì ạ")
        text = get_text()
        contents = wikipedia.summary(text).split('\n')
        speak(contents[0])
        time.sleep(10)
        for content in contents[1:]:
            speak("Bạn muốn nghe thêm không?")
            ans = get_text()
            if "có" not in ans:
                break
            speak(content)
            time.sleep(3)

        speak('Cảm ơn bạn đã lắng nghe!!!')
    except:
        speak("Mình không hiểu bạn nói gì. Xin mời bạn nói lại")


def assistant():
    speak("Xin chào, mình là trợ lý ảo")
    while True:
        text = get_text()
        if not text:
            break
        elif "dừng" in text in text or "chào robot" in text or "kết thúc" in text or "tắt" in text:
            stop()
            break
        elif "giúp" in text:
            asistant_recognize()
        else:
            speak("Bạn cần mình giúp gì ạ?")

mqtt_thread = threading.Thread(target=mqtt_connect)
mqtt_thread.start()

assistant()