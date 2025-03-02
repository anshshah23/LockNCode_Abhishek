import openai
import requests
import validators
import re
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

openai.api_key = "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"

app = FastAPI()

EMAIL_PATTERNS = [
    r"account locked", r"click here to verify", r"urgent action required", r"login to restore access",
    r"update your payment details", r"claim your reward", r"unusual login detected", 
    r"your account will be closed", r"confirm your identity", r"payment failure"
]
URL_PATTERNS = [
    r"\.xyz$", r"\.ru$", r"bit\.ly", r"tinyurl", r"paypal-verify", r"free-gift", 
    r"bonus-offer", r"win-a-prize", r"secure-login", r"account-verification"
]
MESSAGE_PATTERNS = [
    r"win a free iphone", r"exclusive offer", r"limited time deal", r"click to claim your gift", 
    r"congratulations you won", r"bank account suspended", r"send OTP to verify", 
    r"earn money fast", r"loan approval instant", r"guaranteed job offer"
]

class ReinforcementLearning:
    def __init__(self):
        self.policy = {}  

    def store_experience(self, input_data, label, mitigation):
        """ Store phishing patterns and mitigations """
        self.policy[input_data] = {
            "reward": 1 if label == 1 else -1,
            "mitigation": mitigation if mitigation else "Avoid clicking unknown links and verify sender identity."
        }

    def get_policy_action(self, text):
        """ Return mitigation based on trained policy """
        return self.policy.get(text, {"reward": 0, "mitigation": "Be cautious with unknown messages and links."})

reinforcement = ReinforcementLearning()

class PhishingInput(BaseModel):
    text: str = None
    url: str = None
    email_header: str = None
    label: int = None
    mitigation: str = None

def check_url_reputation(url):
    if not validators.url(url):
        return {"error": "Invalid URL"}

    try:
        response = requests.get(f"https://urlscan.io/api/v1/search/?q={url}")
        if response.status_code == 200:
            return {"malicious": "true" in response.text.lower()}
        return {"error": "URL reputation check failed"}
    except requests.RequestException:
        return {"error": "External API failed"}

def openai_detect_phishing(text):
    """ Detect phishing using OpenAI GPT """
    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a cybersecurity expert. Identify if this text is phishing or safe."},
                {"role": "user", "content": f"Classify this text as phishing or safe: {text}"}
            ]
        )
        result = response.choices[0].message.content.lower()
        return {"phishing": "phishing" in result}
    except Exception as e:
        return {"error": f"OpenAI API failed: {str(e)}"}

def analyze_email_headers(email_header):
    """ Check email headers for phishing indicators """
    spoofing_keywords = ["Received-SPF: fail", "X-PHP-Script", "SPF fail", "X-Originating-IP"]
    if any(keyword in email_header for keyword in spoofing_keywords):
        return {"phishing": True, "reason": "Suspicious email headers detected"}
    return {"phishing": False, "reason": "No spoofing detected"}


@app.post("/detect_email")
def detect_email(input_data: PhishingInput):
    if any(re.search(pattern, input_data.text, re.IGNORECASE) for pattern in EMAIL_PATTERNS):
        return {"phishing": True, "reason": "Matched phishing email pattern"}
    return openai_detect_phishing(input_data.text)

@app.post("/detect_url")
def detect_url(input_data: PhishingInput):
    if any(re.search(pattern, input_data.url, re.IGNORECASE) for pattern in URL_PATTERNS):
        return {"phishing": True, "reason": "Matched phishing URL pattern"}
    return check_url_reputation(input_data.url)

@app.post("/detect_message")
def detect_message(input_data: PhishingInput):
    if any(re.search(pattern, input_data.text, re.IGNORECASE) for pattern in MESSAGE_PATTERNS):
        return {"phishing": True, "reason": "Matched phishing message pattern"}
    return openai_detect_phishing(input_data.text)

@app.post("/detect_email_headers")
def detect_email_headers(input_data: PhishingInput):
    return analyze_email_headers(input_data.email_header)

@app.post("/reinforce")
def reinforce_learning(input_data: PhishingInput):
    if input_data.label is None or input_data.text is None:
        raise HTTPException(status_code=400, detail="Label & text required")

    reinforcement.store_experience(input_data.text, input_data.label, input_data.mitigation)
    return {"status": "Policy Updated – System is now smarter!"}

@app.post("/suggest_mitigation")
def suggest_mitigation(input_data: PhishingInput):
    action = reinforcement.get_policy_action(input_data.text)
    return {"solution": action["mitigation"], "reward_score": action["reward"]}

@app.post("/test_reinforcement")
def test_reinforcement(input_data: PhishingInput):
    """ Test if the model has learned from reinforcement """
    action = reinforcement.get_policy_action(input_data.text)
    return {"smart_detection_result": action}
