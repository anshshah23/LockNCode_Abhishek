from fastapi import FastAPI, HTTPException
import pickle
import numpy as np
import pandas as pd
from pydantic import BaseModel

with open("models/Phishing_model.pkl", "rb") as model_file:
    model = pickle.load(model_file)

feature_names = [
    "HTTPS", "SubDomains", "PrefixSuffix", "NonStdPort", "HTTPSDomainURL", "AnchorURL", "ServerFormHandler", "InfoEmail", "AbnormalURL", "WebsiteForwarding", "StatusBarCust", "DisableRightClick", "GoogleIndex", "StatsReport", "AgeofDomain", "DNSRecording", "LinksInScriptTags", "PageRank", "RequestURL"
]

class PhishingRequest(BaseModel):
    HTTPS: int
    SubDomains: int
    PrefixSuffix: int
    NonStdPort: int
    HTTPSDomainURL: int
    AnchorURL: int
    ServerFormHandler: int
    InfoEmail: int
    AbnormalURL: int
    WebsiteForwarding: int
    StatusBarCust: int
    DisableRightClick: int
    GoogleIndex: int
    StatsReport: int
    # AgeofDomain: int
    DNSRecording: int
    LinksInScriptTags: int
    PageRank: int
    RequestURL: int

app = FastAPI()

@app.get("/")
def home():
    return {"message": "Phishing Detection API is running!"}

# @app.post("/analyse")
# def predict_phishing(data: PhishingRequest):
#     try:
#         input_data = pd.DataFrame([data.dict()], columns=feature_names)
#         prediction = model.predict(input_data)
#         result = "Phishing URL" if prediction[0] == 1 else "Legitimate URL"
#         return {"prediction": result}
#     except Exception as e:
#         raise HTTPException(status_code=400, detail=str(e))


@app.post("/predict/")
def predict_phishing(data: PhishingRequest):
    try:
        # Convert request data to a DataFrame with the correct column order
        input_data = pd.DataFrame([data.model_dump()], columns=model.feature_names_in_)
        
        
        prediction = model.predict(input_data)
        
        result = "Phishing URL" if prediction[0] == 1 else "Legitimate URL"
        
        return {"prediction": result}
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))