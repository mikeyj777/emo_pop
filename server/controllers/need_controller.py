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

def create_need(user_id):
    data = request.get_json()
    needs = data['needs']
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        # Check if the user exists in the users table
        cur.execute("SELECT id FROM users WHERE id = %s", (user_id,))
        user_exists = cur.fetchone()

        if not user_exists:
            # Handle the case when the user doesn't exist
            # You can choose to create the user or return an error
            # For example, you can return an error response
            return jsonify({"error": "User not found"}), 404

        cur.execute(
            "INSERT INTO daily_logs (user_id, date) VALUES (%s, CURRENT_DATE) RETURNING id",
            (user_id,)
        )
        daily_log_id = cur.fetchone()[0]

        for need in needs:
            cur.execute(
                "INSERT INTO daily_needs (daily_log_id, need) VALUES (%s, %s)",
                (daily_log_id, need)
            )

        conn.commit()
        cur.close()
        conn.close()
        return jsonify({"message": "Needs created successfully"}), 201
    except Exception as e:
        print("Error creating needs:", str(e))
        return jsonify({"error": "Internal server error"}), 500