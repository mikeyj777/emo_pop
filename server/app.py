from flask import Flask, jsonify
from controllers.user_controller import get_user
from controllers.emotion_controller import get_emotions, create_emotion, load_emotions
from controllers.need_controller import get_needs, create_need, load_needs
from flask_cors import CORS

from controllers.data_controller import check_existing_data

import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')


app = Flask(__name__)
CORS(app, resources={
    r"/*": {  # This specifically matches your API routes
        "origins": ["http://localhost:3000", "http://emo.riskspace.net"],
        "methods": ["GET", "POST", "OPTIONS"],  # Explicitly allow methods
        "allow_headers": ["Content-Type"]  # Allow common headers
    }
})

@app.route('/api/users', methods=['POST'])
def user_route():
    logging.debug('getting user')
    return get_user()

@app.route('/api/load-emotions', methods=['GET'])
def load_emotions_route():
    logging.debug('getting emotions from app py')
    return load_emotions() 

@app.route('/api/load-needs', methods=['GET'])
def load_needs_route():
    logging.debug('getting needs from app py')
    return load_needs() 


@app.route('/api/emotions/<int:user_id>', methods=['GET'])
def get_emotions_route(user_id):
    return get_emotions(user_id) 

@app.route('/api/needs/<int:user_id>', methods=['GET'])
def get_needs_route(user_id):
    return get_needs(user_id) 

@app.route('/api/emotions/<int:user_id>', methods=['POST'])
def create_emotion_route(user_id):
    return create_emotion(user_id)

@app.route('/api/needs/<int:user_id>', methods=['POST'])
def create_need_route(user_id):
    return create_need(user_id)

@app.route('/api/check-existing-data/<int:user_id>', methods=['GET'])
def check_existing_data_route(user_id):
    return check_existing_data(user_id)

@app.route("/")
def home():
    return jsonify({"message": "This is the Emo Pop API."})

if __name__ == '__main__':
    app.run("0.0.0.0", debug=False)
