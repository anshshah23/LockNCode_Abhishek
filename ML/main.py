from fastapi import FastAPI
from pydantic import BaseModel
import pickle
import numpy as np

with open("phishing_detection_model.pkl", "rb") as model_file:
    model = pickle.load(model_file)

with open("tfidf_vectorizer.pkl", "rb") as vectorizer_file:
    vectorizer = pickle.load(vectorizer_file)

app = FastAPI()

class EmailInput(BaseModel):
    message: str

@app.post("/predict")
def predict_email(input_data: EmailInput):
    input_features = vectorizer.transform([input_data.message])
    
    prediction = model.predict(input_features)
    
    result = "Normal mail" if prediction[0] == 1 else "Spam mail"
    
    return {"message": input_data.message, "classification": result}

