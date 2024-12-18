from flask import request, jsonify
from config.db import get_db_connection
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')

def get_emotions(user_id):
    days = request.args.get('days', 7)
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("""
            SELECT
                date,
                SUM(CASE WHEN e.is_positive THEN 1 ELSE 0 END) AS "positiveCount",
                SUM(CASE WHEN e.is_positive THEN 0 ELSE 1 END) AS "negativeCount"
            FROM daily_logs dl
            JOIN daily_emotions de ON dl.id = de.daily_log_id
            JOIN emotions e ON de.emotion = e.name
            WHERE dl.user_id = %s
            GROUP BY date
            ORDER BY date DESC
            LIMIT %s
        """, (user_id, days))
        emotions = cur.fetchall()
        cur.close()
        conn.close()

        # Format the data for the React component
        formatted_emotions = []
        for row in emotions:
            formatted_emotions.append({
                "date": row[0].strftime("%Y-%m-%d"),  # Format date as string
                "positiveCount": row[1],
                "negativeCount": row[2]
            })

        return jsonify(formatted_emotions)
    except Exception as e:
        return jsonify({"error": "Internal server error"}), 500

def create_emotion(user_id):
    data = request.get_json()
    emotions = data['emotions']
    emotion_type = data['type']
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO daily_logs (user_id, date) VALUES (%s, CURRENT_DATE) RETURNING id",
            (user_id,)
        )
        daily_log_id = cur.fetchone()[0]

        for emotion in emotions:
            cur.execute(
                "INSERT INTO daily_emotions (daily_log_id, emotion, emotion_type) VALUES (%s, %s, %s)",
                (daily_log_id, emotion, emotion_type)
            )
            
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({"message": "Emotions created successfully"}), 201
    except Exception as e:
        print("Error creating emotions:", str(e))
        return jsonify({"error": "Internal server error"}), 500