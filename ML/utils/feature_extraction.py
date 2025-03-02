import re
import numpy as np
import tldextract
from urllib.parse import urlparse
from ML.utils.domain_reputation import get_domain_reputation

def extract_features(url):
    """Extracts lexical, domain-based, and reputation-based features from a given URL."""
    features = {}
    
    # Lexical Features
    parsed_url = urlparse(url)
    features['length'] = len(url)
    features['num_dots'] = url.count('.')
    features['num_hyphens'] = url.count('-')
    features['num_slashes'] = url.count('/')
    
    # Domain Features
    domain_info = tldextract.extract(url)
    features['domain_length'] = len(domain_info.domain)
    features['subdomain_length'] = len(domain_info.subdomain)
    features['is_https'] = 1 if parsed_url.scheme == 'https' else 0

    # Reputation Features
    reputation_data = get_domain_reputation(url)
    features.update(reputation_data)

    return np.array(list(features.values()))