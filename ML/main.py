from fastapi import FastAPI
from pydantic import BaseModel
import pickle
import numpy as np


from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Add CORS middleware to allow all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "*"
    ],  # Allows all origins, or you can specify a list of allowed domains
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers
)
with open("models/phishing_detection_model.pkl", "rb") as model_file:
    model = pickle.load(model_file)

with open("models/tfidf_vectorizer.pkl", "rb") as vectorizer_file:
    vectorizer = pickle.load(vectorizer_file)


class EmailInput(BaseModel):
    message: str


@app.post("/predict")
def predict_email(input_data: EmailInput):
    input_features = vectorizer.transform([input_data.message])

    prediction = model.predict(input_features)

    result = "Normal mail" if prediction[0] == 1 else "Spam mail"

    return {"message": input_data.message, "classification": result}
