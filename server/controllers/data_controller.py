from flask import jsonify
from config.db import get_db_connection

def check_existing_data(user_id):
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("""
            SELECT EXISTS (
                SELECT 1
                FROM daily_logs
                WHERE user_id = %s AND date = CURRENT_DATE
            )
        """, (user_id,))
        has_existing_data = cur.fetchone()[0]

        cur.close()
        conn.close()

        return jsonify({"hasExistingData": has_existing_data}), 200
    except Exception as e:
        print("Error checking existing data:", str(e))
        return jsonify({"error": "Internal server error"}), 500