
import requests
import time
import random

BACKEND = "https://iot-pp8j.onrender.com"
DEVICE_NAME = "blue_bulb"


r = requests.post(f"{BACKEND}/api/devices", json={"name": DEVICE_NAME, "location": "living-room"})
device = r.json()
device_id = device["_id"]
print("Device created:", device_id)

try:
    for i in range(60):  
        watts = round(random.uniform(10, 2000), 2)
        payload = {"deviceId": device_id, "watts": watts}
        requests.post(f"{BACKEND}/api/readings", json=payload)
        print(f"Sent reading {i+1}: {watts} W")
        time.sleep(10)  
except KeyboardInterrupt:
    print("Stopped simulation")
