from fastapi import FastAPI, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pickle
import numpy as np
import pandas as pd
import requests
import whois
import datetime
import sqlite3
import io
import os
import tldextract
import re
from urllib.parse import urlparse

# ----------------------- Initialize FastAPI -----------------------
app = FastAPI()

# Enable CORS for frontend interaction
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------------- Load Models -----------------------
# Get absolute paths for model files
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH_URL = os.path.join(BASE_DIR, "models", "Phishing_model.pkl")
MODEL_PATH_EMAIL = os.path.join(BASE_DIR, "models", "phishing_detection_model.pkl")
VECTORIZER_PATH = os.path.join(BASE_DIR, "models", "tfidf_vectorizer.pkl")
DB_PATH = os.path.join(BASE_DIR, "dataset", "domain_history.db")

# Check if models exist
if not os.path.exists(MODEL_PATH_URL):
    raise FileNotFoundError(f"❌ URL Phishing Model Missing: {MODEL_PATH_URL}")

if not os.path.exists(MODEL_PATH_EMAIL):
    raise FileNotFoundError(f"❌ Email Phishing Model Missing: {MODEL_PATH_EMAIL}")

if not os.path.exists(VECTORIZER_PATH):
    raise FileNotFoundError(f"❌ TF-IDF Vectorizer Missing: {VECTORIZER_PATH}")

# Load models
with open(MODEL_PATH_URL, "rb") as f:
    url_model = pickle.load(f)

with open(MODEL_PATH_EMAIL, "rb") as model_file:
    email_model = pickle.load(model_file)

with open(VECTORIZER_PATH, "rb") as vectorizer_file:
    vectorizer = pickle.load(vectorizer_file)

print("✅ All models loaded successfully!")

# ----------------------- Database Initialization -----------------------
conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()
cursor.execute('''
    CREATE TABLE IF NOT EXISTS domain_reputation (
        domain TEXT PRIMARY KEY,
        google_safe INTEGER,
        domain_age INTEGER,
        last_checked TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
''')
conn.commit()
conn.close()

# ----------------------- API Request Models -----------------------
class URLInput(BaseModel):
    url: str

class EmailInput(BaseModel):
    message: str

# ----------------------- Utility Functions -----------------------
def check_google_safe_browsing(url):
    """Checks if URL is flagged in Google Safe Browsing API."""
    GOOGLE_SAFE_BROWSING_API_KEY = "YOUR_GOOGLE_SAFE_BROWSING_API_KEY"
    api_url = "https://safebrowsing.googleapis.com/v4/threatMatches:find"
    payload = {
        "client": {"clientId": "phishing-detection", "clientVersion": "1.0"},
        "threatInfo": {
            "threatTypes": ["MALWARE", "SOCIAL_ENGINEERING"],
            "platformTypes": ["ANY_PLATFORM"],
            "threatEntryTypes": ["URL"],
            "threatEntries": [{"url": url}]
        }
    }
    headers = {"Content-Type": "application/json"}
    response = requests.post(api_url, params={"key": GOOGLE_SAFE_BROWSING_API_KEY}, json=payload, headers=headers)
    return bool(response.json().get("matches", []))

def get_whois_info(domain):
    """Fetches WHOIS details of the domain."""
    try:
        domain_info = whois.whois(domain)
        domain_age = (datetime.datetime.now() - domain_info.creation_date).days if domain_info.creation_date else 0
        return {"domain_age_days": domain_age, "is_private": domain_info.privacy_protection}
    except:
        return {"domain_age_days": 0, "is_private": False}

def extract_features(url):
    """Extracts lexical, domain-based, and reputation-based features with 21 attributes."""
    parsed_url = urlparse(url)
    domain_info = tldextract.extract(url)

    features = {
        "length": len(url),
        "num_dots": url.count('.'),
        "num_hyphens": url.count('-'),
        "num_slashes": url.count('/'),
        "domain_length": len(domain_info.domain),
        "subdomain_length": len(domain_info.subdomain),
        "is_https": 1 if parsed_url.scheme == 'https' else 0,
        "google_safe": check_google_safe_browsing(url),
    }

    whois_info = get_whois_info(url)
    features.update(whois_info)

    # Adding Extra Features to Make 21 Total Features
    features.update({
        "num_digits": sum(c.isdigit() for c in url),
        "num_special_chars": sum(c in "!@#$%^&*()" for c in url),
        "num_query_params": url.count('?'),
        "num_subdomains": domain_info.subdomain.count('.'),
        "num_fragments": url.count('#'),
        "has_ip_address": 1 if re.search(r"\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}", url) else 0,
        "url_entropy": -sum((url.count(c) / len(url)) * np.log2(url.count(c) / len(url)) for c in set(url)),
        "url_path_length": len(parsed_url.path),
        "num_uppercase_chars": sum(1 for c in url if c.isupper()),
        "tld_length": len(domain_info.suffix),
        "is_shortened": 1 if "bit.ly" in url or "t.co" in url or "goo.gl" in url else 0,
    })

    if len(features) != 21:
        raise ValueError(f"❌ Feature extraction error! Expected 21, but got {len(features)}")

    return np.array(list(features.values()))

# ----------------------- FastAPI Endpoints -----------------------

@app.get("/")
def home():
    """Root endpoint to check if API is running."""
    return {"message": "Unified Phishing Detection API is running!"}

@app.post("/predict-email")
def predict_email(input_data: EmailInput):
    """Predict whether an email is phishing or legitimate."""
    input_features = vectorizer.transform([input_data.message])
    prediction = email_model.predict(input_features)
    result = "Legitimate mail" if prediction[0] == 1 else "Phishy mail"
    return {"message": input_data.message, "classification": result}

@app.post("/predict-url")
async def predict_url(url_input: URLInput):
    """Predict whether a URL is phishing or safe."""
    url = url_input.url
    domain = url.split("//")[-1].split("/")[0]

    try:
        # Extract features
        features = extract_features(url).reshape(1, -1)
        print(f"✅ Extracted Features Shape: {features.shape}")  # Should be (1, 21)

        # Predict with ML model
        prediction = url_model.predict(features)[0]

        return {"url": url, "prediction": "Phishing" if prediction == -1 else "Safe"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict-url-batch")
async def predict_url_batch(file: UploadFile):
    """Predict phishing URLs from a CSV file."""
    try:
        content = await file.read()
        df = pd.read_csv(io.StringIO(content.decode('utf-8')))

        if "url" not in df.columns:
            raise HTTPException(status_code=400, detail="CSV must contain a column named 'url'.")

        df['features'] = df['url'].apply(lambda x: extract_features(x))
        X = np.vstack(df['features'].values)

        df['prediction'] = url_model.predict(X)
        df['prediction'] = df['prediction'].map({-1: 'Phishing', 1: 'Safe'})

        return {"predictions": df[['url', 'prediction']].to_dict(orient="records")}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
