from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
import os
import tempfile

from AiAnalyzer import get_skin_disease_recommendations
from prediction import predict_image

app = Flask(__name__)
CORS(app, resources={
    r"/upload": {"origins": "*"},
    r"/recommend": {"origins": "*"}
})

UPLOAD_FOLDER = './uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.route('/')
def home():
    return jsonify({
        'message': 'Test : Skin Disease Recommendation API',
        'usage': 'POST to /recommend with {"skin_disease": "condition_name"}'
    })

@app.route('/recommend', methods=['POST'])
def recommend():
    """
    Main endpoint - just send skin disease name and get recommendations
    """
    try:
        data = request.get_json()
        
        # Check if skin_disease is provided
        if not data or 'skin_disease'not in data or 'allergies' not in data:
            return jsonify({'error': 'Please provide skin_disease and/or allergies in request body'}), 400
        
        skin_disease = data['skin_disease'].strip()
        allergies = data['allergies'].strip()
        
        if not skin_disease :
            return jsonify({'error': 'skin_disease cannot be empty'}), 400
        
        if not data or 'skin_disease' not in data:
            return jsonify({'error': 'Please provide skin_disease in request body'}), 400
        
        skin_disease = data['skin_disease'].strip()
        allergies = data['allergies'].strip()

        if not skin_disease:
            return jsonify({'error': 'skin_disease cannot be empty'}), 400
        
        if not allergies: 
            return jsonify({'error': 'allergies cannot be empty'}), 400

        # Get recommendations from Gemini
        logger.info(f"Getting recommendations for: {skin_disease}")
        recommendations = get_skin_disease_recommendations(skin_disease, allergies)
        
        return jsonify(recommendations)
        
    except Exception as e:
        logger.error(f"Error in recommend endpoint: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/upload', methods=['POST'])
def upload_image():
    try:
        if 'image' not in request.files:
            logger.error('No image in request.files: %s', request.files.keys())
            return jsonify({'error': 'No image uploaded'}), 409
    except Exception as e:
        logger.exception("Full upload error:")
    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    # Simple check
    allowed_extensions = ('.png', '.jpg', '.jpeg', '.PNG', '.JPG', '.JPEG')
    if not file.filename.lower().endswith(('.png', '.jpg', '.jpeg')):
        return jsonify({'error': 'Invalid file type'}), 400

    # --- Use mkstemp for Windows compatibility ---
    fd, temp_path = tempfile.mkstemp(suffix='.jpg')
    os.close(fd)  # Close immediately to release the lock

    try:
        file.save(temp_path)
        prediction = predict_image(temp_path)
    finally:
        os.remove(temp_path)  # Clean up manually

    return jsonify({'message': 'Image received', 'prediction': prediction})

@app.route('/health')
def health():
    """Simple health check"""
    return jsonify({'status': 'API is running'})

if __name__ == '__main__':
    print("Starting Simple Skin Disease Recommendation API...")
    print("Make sure to set GEMINI_API_KEY environment variable")
    print("Usage: POST to /recommend with {'skin_disease': 'acne'}")
    app.run(debug=True, host='0.0.0.0', port=5000)
