import requests

BASE_URL = "http://localhost:8000"

test_data = {
    "email": {"text": "Your account has been locked, click here to verify."},
    "url": {"url": "http://free-money.xyz"},
    "message": {"text": "Congratulations! You won a free iPhone. Click here to claim."},
    "email_headers": {"email_header": "Received-SPF: fail"},
    "reinforce": {"text": "Suspicious email", "label": 1, "mitigation": "Warn about fake login pages"},
    "test_reinforcement": {"text": "Suspicious email"}
}

def send_post(endpoint, data):
    return requests.post(f"{BASE_URL}/{endpoint}", json=data).json()

print(send_post("detect_email", test_data["email"]))
print(send_post("detect_url", test_data["url"]))
print(send_post("detect_message", test_data["message"]))
print(send_post("detect_email_headers", test_data["email_headers"]))
print(send_post("reinforce", test_data["reinforce"]))
print(send_post("test_reinforcement", test_data["test_reinforcement"]))
