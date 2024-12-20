from flask import request, jsonify
from config.db import get_db_connection

import logging

logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')

def get_needs(user_id):
    days = request.args.get('days', 7)
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("""
            SELECT 
                dl.date,
                COUNT(dn.id) AS "needsCount"
            FROM 
                daily_logs dl
            LEFT JOIN 
                daily_needs dn ON dl.id = dn.daily_log_id
            WHERE 
                dl.user_id = %s
            GROUP BY 
                dl.date
            ORDER BY 
                dl.date DESC
            LIMIT %s
        """, (user_id, days))
        needs = cur.fetchall()
        cur.close()
        conn.close()
        # Format the data for the React component
        formatted_needs = []
        for row in needs:
            formatted_needs.append({
                "date": row[0].strftime("%Y-%m-%d"),  # Format date as string
                "needs": row[1],
            })
        
        return jsonify(formatted_needs)
    except Exception as e:
        return jsonify({"error": "Internal server error"}), 500

def log_needs(user_id):
    data = request.get_json()
    needs = data['needs']
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        # Check if the user exists in the users table
        cur.execute("SELECT id FROM users WHERE id = %s", (user_id,))
        user_exists = cur.fetchone()

        if not user_exists:
            return jsonify({"error": "User not found"}), 404

        # Check if there's already a daily log for this user today
        cur.execute(
            """
            SELECT id FROM daily_logs 
            WHERE user_id = %s 
            AND date = CURRENT_DATE
            """,
            (user_id,)
        )
        existing_log = cur.fetchone()
        
        if existing_log:
            daily_log_id = existing_log[0]
            # Check for existing needs
            for need in needs:
                cur.execute(
                    """
                    SELECT id FROM daily_needs 
                    WHERE daily_log_id = %s 
                    AND need = %s
                    """,
                    (daily_log_id, need)
                )
                if not cur.fetchone():  # Only insert if need doesn't exist
                    cur.execute(
                        """
                        INSERT INTO daily_needs (daily_log_id, need) 
                        VALUES (%s, %s)
                        """,
                        (daily_log_id, need)
                    )
                    logging.info(f"Need logged: {need}, daily log id: {daily_log_id}")
        else:
            # Create new daily log if none exists
            cur.execute(
                "INSERT INTO daily_logs (user_id, date) VALUES (%s, CURRENT_DATE) RETURNING id",
                (user_id,)
            )
            daily_log_id = cur.fetchone()[0]
            
            # Insert all needs since this is a new log
            for need in needs:
                cur.execute(
                    """
                    INSERT INTO daily_needs (daily_log_id, need) 
                    VALUES (%s, %s)
                    """,
                    (daily_log_id, need)
                )
                logging.info(f"Need logged: {need}, daily log id: {daily_log_id}")

        conn.commit()
        cur.close()
        conn.close()
        return jsonify({"message": "Needs created successfully"}), 201
    except Exception as e:
        print("Error creating needs:", str(e))
        return jsonify({"error": "Internal server error"}), 500

def load_needs():
    logging.info("Loading needs...")
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT * FROM needs")
        needs = cur.fetchall()
        cur.close()
        conn.close()
        return jsonify(needs)
    except Exception as e:
        print("Error loading needs:", str(e))
        return jsonify({"error": "Internal server error"}), 500