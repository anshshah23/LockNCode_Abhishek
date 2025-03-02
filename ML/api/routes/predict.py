from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import pickle
import numpy as np
from utils.feature_extraction import extract_features
from utils.historical_data import get_cached_reputation, save_domain_reputation

with open("../models/phishing_model.pkl", "rb") as f:
    model = pickle.load(f)

router = APIRouter()

class URLInput(BaseModel):
    url: str

@router.post("/predict")
async def predict(url_input: URLInput):
    """Real-time URL phishing detection."""
    url = url_input.url
    domain = url.split("//")[-1].split("/")[0]

    try:
        cached_data = get_cached_reputation(domain)
        if cached_data:
            return {"url": url, "prediction": "Phishing" if cached_data[1] == 1 else "Safe"}

        features = extract_features(url).reshape(1, -1)
        prediction = model.predict(features)[0]

        save_domain_reputation(domain, {"google_safe": prediction == -1})
        return {"url": url, "prediction": "Phishing" if prediction == -1 else "Safe"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))