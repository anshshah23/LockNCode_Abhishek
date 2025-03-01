import requests

url = "http://127.0.0.1:8000/predict"
data = {
    "message": "Congratulations! You've won a $1000 gift card. Click here to claim your prize!"
}

response = requests.post(url, json=data)
print(response.json())
