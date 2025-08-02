from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
from AiAnalyzer import get_skin_disease_recommendations

print(get_skin_disease_recommendations("acne", "pollen"))
# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
    return jsonify({
        'message': 'Skin Disease Recommendation API',
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
        if not data or 'skin_disease' or 'allergies' not in data:
            return jsonify({'error': 'Please provide skin_disease and/or allergies in request body'}), 400
        
        skin_disease = data['skin_disease'].strip()
        allergies = data['allegies'].strip()
        
        if not skin_disease :
            return jsonify({'error': 'skin_disease cannot be empty'}), 400
        
        # Get recommendations from Gemini
        logger.info(f"Getting recommendations for: {skin_disease}")
        recommendations = get_skin_disease_recommendations(skin_disease, allergies)
        
        return jsonify(recommendations)
        
    except Exception as e:
        logger.error(f"Error in recommend endpoint: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/health')
def health():
    """Simple health check"""
    return jsonify({'status': 'API is running'})

if __name__ == '__main__':
    print("Starting Simple Skin Disease Recommendation API...")
    print("Make sure to set GEMINI_API_KEY environment variable")
    print("Usage: POST to /recommend with {'skin_disease': 'acne'}")
    app.run(debug=True, host='0.0.0.0', port=5000)