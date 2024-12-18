import os
import sys
import csv

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import csv
from config.db import get_db_connection

def parse_emotions_csv(file_path, is_positive):
    conn = get_db_connection()
    cur = conn.cursor()

    with open(file_path, 'r') as file:
        reader = csv.DictReader(file)
        for row in reader:
            for emotion in row.values():
                if emotion.strip():  # Skip empty emotions
                    cur.execute(
                        "INSERT INTO emotions (name, is_positive) VALUES (%s, %s)",
                        (emotion.strip(), is_positive)
                    )

    conn.commit()
    cur.close()
    conn.close()

if __name__ == '__main__':
    conn = get_db_connection()
    cur = conn.cursor()

    # Clear all records from the emotions table
    cur.execute("DELETE FROM emotions")
    conn.commit()
    cur.close()
    conn.close()
    data_type = ['positive', 'negative']
    is_positive = True
    for data in data_type:
        parse_emotions_csv(f'C://coding//tracking_emotions_micro//client//src//data//feelings_{data}.csv', is_positive=is_positive)
        is_positive = not is_positive