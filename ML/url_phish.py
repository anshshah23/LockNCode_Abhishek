from fastapi import FastAPI, File, UploadFile, HTTPException
from pydantic import BaseModel
import pickle
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from fastapi.middleware.cors import CORSMiddleware
import os

# Load the trained phishing detection model
MODEL_PATH = "models/Phishing_model.pkl"
with open(MODEL_PATH, "rb") as file:
    model = pickle.load(file)

# Load dataset for EDA and visualization
DATASET_PATH = "models/phishing.csv"
df = pd.read_csv(DATASET_PATH)

# Create 'plots' directory if not exists
if not os.path.exists("plots"):
    os.makedirs("plots")

# FastAPI app instance
app = FastAPI()

# Enable CORS (for frontend integration)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins (frontend connection)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Feature columns used in the model
FEATURE_COLUMNS = df.drop(columns=["class", "Index"], errors="ignore").columns.tolist()

# Request model for prediction
class PhishingRequest(BaseModel):
    features: list

# Route: Home
@app.get("/")
def home():
    return {"message": "Phishing Detection API is running"}

# Route: Predict phishing URL
@app.post("/predict")
def predict(data: PhishingRequest):
    try:
        input_data = np.array(data.features).reshape(1, -1)
        prediction = model.predict(input_data)[0]
        result = "Phishing" if prediction == -1 else "Safe"
        return {"prediction": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Function to generate and save plots
def generate_plots():
    plots = {}
    
    # 1. Phishing count pie chart
    plt.figure()
    df['class'].value_counts().plot(kind='pie', autopct='%1.2f%%')
    plt.title("Phishing Count")
    plt.savefig("plots/phishing_count.png")
    plots["phishing_count"] = "plots/phishing_count.png"

    # 2. HTTPS count plot
    plt.figure()
    count = sns.countplot(x=df.HTTPS, data=df)
    for i in count.containers:
        count.bar_label(i)
    plt.title("Phishing count of HTTPS")
    plt.savefig("plots/https_count.png")
    plots["https_count"] = "plots/https_count.png"

    # 3. SubDomains count plot
    plt.figure()
    count = sns.countplot(x=df.SubDomains, data=df)
    for i in count.containers:
        count.bar_label(i)
    plt.title("The count of SubDomains")
    plt.savefig("plots/subdomains_count.png")
    plots["subdomains_count"] = "plots/subdomains_count.png"
    
    # 4. Heatmap of correlations
    plt.figure(figsize=(12, 12))
    sns.heatmap(df.corr(), annot=True)
    plt.title("Feature Correlation Heatmap")
    plt.savefig("plots/heatmap.png")
    plots["heatmap"] = "plots/heatmap.png"
    
    return plots

# Route: Get all plots
@app.get("/plots")
def get_plots():
    plots = generate_plots()
    return {"plots": plots}

# Route: Get dataset statistics
@app.get("/dataset-info")
def dataset_info():
    return {
        "shape": df.shape,
        "columns": FEATURE_COLUMNS,
        "missing_values": df.isnull().sum().to_dict(),
        "class_distribution": df['class'].value_counts().to_dict()
    }
