import os
import psycopg2
from urllib.parse import urlparse

import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')

logging.debug(f"connecting to db. environ var for password exists:  {'DB_PASSWORD' in os.environ}")

def get_db_connection():
    if 'DB_PASSWORD' in os.environ:
        pwd = os.environ['DB_PASSWORD']
        conn = psycopg2.connect(
            host="localhost",
            database="postgres",
            user="postgres",
            password=pwd,
            port="5432"
        )
    else:
        # Local development
        from data.pwds import Pwds
        conn = psycopg2.connect(
            host="localhost",
            database="postgres",
            user="postgres",
            password=Pwds.pg_pwd,
            port="5432"
        )
    return conn
