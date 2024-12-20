import re
import os
import sys
import csv

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import csv
from config.db import get_db_connection

def sanitize_string(text):
    # Remove or replace characters that could cause issues
    # This keeps alphanumeric characters, spaces, and basic punctuation
    text = text.strip().lower()
    # text = re.sub(r'[^a-zA-Z0-9\-_]', '_', str(text))
    return text

def parse_emotions_csv(file_path, is_positive):
    conn = get_db_connection()
    cur = conn.cursor()

    with open(file_path, 'r') as file:
        reader = csv.DictReader(file)
        for row in reader:
            for header, emotion in row.items():
                if emotion.strip():  # Skip empty emotions
                    e = sanitize_string(emotion)
                    h = sanitize_string(header)
                    query = "INSERT INTO emotions (header, name, is_positive) VALUES (%s, %s, %s)"
                    cur.execute(query, (h, e, is_positive))

    conn.commit()
    cur.close()
    conn.close()

def parse_needs_csv(file_path):
    conn = get_db_connection()
    cur = conn.cursor()

    with open(file_path, 'r') as file:
        reader = csv.DictReader(file)
        for row in reader:
            for header, need in row.items():
                if need.strip():  # Skip empty needs
                    n = sanitize_string(need)
                    h = sanitize_string(header)
                    query = "INSERT INTO needs (header, name) VALUES (%s, %s)"
                    cur.execute(query, (h, n))

    conn.commit()
    cur.close()
    conn.close()

if __name__ == '__main__':
    conn = get_db_connection()
    cur = conn.cursor()

    # Clear all records from the emotions table
    cur.execute("DELETE FROM emotions")
    cur.execute("DELETE FROM needs")
    conn.commit()
    cur.close()
    conn.close()
    data_type = ['positive', 'negative']
    is_positive = True
    for data in data_type:
        parse_emotions_csv(f'data/feelings_{data}.csv', is_positive=is_positive)
        is_positive = not is_positive

    parse_needs_csv('data/needs.csv')