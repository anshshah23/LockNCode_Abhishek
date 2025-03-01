from fastapi import FastAPI
from pydantic import BaseModel
import numpy as np
import pickle
from urllib.parse import urlparse
import requests
import re
from typing import List
import ipaddress

app = FastAPI()


class URLCheckRequest(BaseModel):
    urls: List[str]


def having_ip(url):
    try:
        ipaddress.ip_address(url)
        return 1
    except:
        return 0


def have_at_sign(url):
    return 1 if "@" in url else 0


def get_length(url):
    return 1 if len(url) >= 54 else 0


def get_depth(url):
    return sum(1 for segment in urlparse(url).path.split("/") if segment)


def redirection(url):
    return 1 if url.rfind("//") > 7 else 0


def http_domain(url):
    return 1 if "https" in urlparse(url).netloc else 0


def tiny_url(url):
    shortening_services = r"bit\.ly|goo\.gl|tinyurl|t\.co"
    return 1 if re.search(shortening_services, url) else 0


def prefix_suffix(url):
    return 1 if "-" in urlparse(url).netloc else 0


def iframe(response):
    return 0 if re.findall(r"<iframe>|<frameBorder>", response.text) else 1


def mouse_over(response):
    return 1 if re.findall("<script>.+onmouseover.+</script>", response.text) else 0


def right_click(response):
    return 0 if re.findall(r"event.button ?== ?2", response.text) else 1


def forwarding(response):
    return 1 if len(response.history) > 2 else 0


def get_http_response(url):
    try:
        return requests.get(url, timeout=5)
    except requests.exceptions.RequestException:
        return None


def extract_features(url):
    features = [
        having_ip(url),
        have_at_sign(url),
        get_length(url),
        get_depth(url),
        redirection(url),
        http_domain(url),
        tiny_url(url),
        prefix_suffix(url),
        0,
        0,
        0,
        0,
    ]
    response = get_http_response(url)
    if response:
        features.extend(
            [
                iframe(response),
                mouse_over(response),
                right_click(response),
                forwarding(response),
            ]
        )
    else:
        features.extend([0, 0, 0, 0])
    return features


def convert_bool(obj):
    """Recursively convert numpy.bool_ to Python bool."""
    if isinstance(obj, np.bool_):
        return bool(obj)
    if isinstance(obj, list):
        return [convert_bool(x) for x in obj]
    if isinstance(obj, dict):
        return {k: convert_bool(v) for k, v in obj.items()}
    return obj


def predict_phishing(features):
    with open("mlp_model.pkl", "rb") as file:
        loaded_model = pickle.load(file)
    return loaded_model.predict(np.array([features]))[0]


@app.post("/check-phishing/")
def check_phishing(request: URLCheckRequest):
    results = []
    for url in request.urls:
        prediction = predict_phishing(extract_features(url)) == 0
        results.append({"url": url, "phishing": convert_bool(prediction)})
    return {"results": results}
