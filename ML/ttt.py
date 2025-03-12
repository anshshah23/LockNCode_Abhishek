# import os
# import sqlite3

# # Use the current working directory
# BASE_DIR = os.getcwd()  # Get current working directory
# DB_PATH = os.path.join(BASE_DIR, 'dataset', 'domain_history.db')

# # Ensure dataset folder exists
# if not os.path.exists(os.path.join(BASE_DIR, 'dataset')):
#     os.makedirs(os.path.join(BASE_DIR, 'dataset'))

# # Create and initialize the database
# conn = sqlite3.connect(DB_PATH)
# cursor = conn.cursor()
# cursor.execute('''
#     CREATE TABLE IF NOT EXISTS domain_reputation (
#         domain TEXT PRIMARY KEY,
#         google_safe INTEGER,
#         domain_age INTEGER,
#         last_checked TIMESTAMP DEFAULT CURRENT_TIMESTAMP
#     )
# ''')
# conn.commit()
# conn.close()

# print('Database successfully created at:', DB_PATH)


import os
import pickle 

# Get the absolute path of the script
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Correct Paths for Model Files
MODEL_PATH_URL = os.path.join(BASE_DIR, "models", "Phishing_model.pkl")
MODEL_PATH_EMAIL = os.path.join(BASE_DIR, "models", "phishing_detection_model.pkl")
VECTORIZER_PATH = os.path.join(BASE_DIR, "models", "tfidf_vectorizer.pkl")
DB_PATH = os.path.join(BASE_DIR, "dataset", "domain_history.db")

# Verify paths before loading
if not os.path.exists(MODEL_PATH_URL):
    raise FileNotFoundError(f"URL Phishing Model Missing: {MODEL_PATH_URL}")

if not os.path.exists(MODEL_PATH_EMAIL):
    raise FileNotFoundError(f"Email Phishing Model Missing: {MODEL_PATH_EMAIL}")

if not os.path.exists(VECTORIZER_PATH):
    raise FileNotFoundError(f"TF-IDF Vectorizer Missing: {VECTORIZER_PATH}")

# Load models
with open(MODEL_PATH_URL, "rb") as f:
    url_model = pickle.load(f)

with open(MODEL_PATH_EMAIL, "rb") as model_file:
    email_model = pickle.load(model_file)

with open(VECTORIZER_PATH, "rb") as vectorizer_file:
    vectorizer = pickle.load(vectorizer_file)

print("✅ All models loaded successfully!")
