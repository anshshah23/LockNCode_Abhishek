import requests
import whois
import datetime

GOOGLE_SAFE_BROWSING_API_KEY = "AIzaSyAkfZathRysRCJHsU7wLMv4TAJhlmGN_ew"
VIRUSTOTAL_API_KEY = "645105f009c2a7f0afa4b9ce290a34c6e940a58c9877c8a1350aeca4d5ee61b8"

def check_google_safe_browsing(url):
    """Checks if URL is unsafe using Google Safe Browsing API."""
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

def check_whois(domain):
    """Fetches WHOIS information for domain age and privacy settings."""
    try:
        domain_info = whois.whois(domain)
        domain_age = (datetime.datetime.now() - domain_info.creation_date).days if domain_info.creation_date else 0
        return {"domain_age_days": domain_age, "is_private": domain_info.privacy_protection}
    except:
        return {"domain_age_days": 0, "is_private": False}

def get_domain_reputation(url):
    """Combines reputation checks."""
    domain = url.split("//")[-1].split("/")[0]
    return {
        "google_safe": check_google_safe_browsing(url),
        **check_whois(domain)
    }