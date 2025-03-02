import sqlite3

conn = sqlite3.connect("../dataset/domain_history.db")
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

def save_domain_reputation(domain, reputation_data):
    """Stores domain reputation in SQLite."""
    cursor.execute('''
        INSERT OR REPLACE INTO domain_reputation (domain, google_safe, domain_age)
        VALUES (?, ?, ?)
    ''', (domain, reputation_data['google_safe'], reputation_data['domain_age_days']))
    conn.commit()

def get_cached_reputation(domain):
    """Fetches cached domain reputation."""
    cursor.execute('SELECT * FROM domain_reputation WHERE domain = ?', (domain,))
    return cursor.fetchone()