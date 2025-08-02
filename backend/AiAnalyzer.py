import google.generativeai as genai
import json
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Configuration - Set your Gemini API key as environment variable
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
if not GEMINI_API_KEY:
    raise ValueError("Please set GEMINI_API_KEY environment variable")

# Configure Gemini
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-1.5-flash')

def get_skin_disease_recommendations(skin_disease):
    """
    Simple function to prompt Gemini AI for skin disease recommendations
    """
    
    # Create a simple, focused prompt
    prompt = f"""
    Please provide supplement and healthy food recommendations for {skin_disease}.
    
    Format your response as JSON with this structure:
    {{
        "condition": "{skin_disease}",
        "supplements": [
            {{
                "name": "supplement name",
                "benefit": "how it helps with {skin_disease}",
                "dosage": "recommended daily amount"
            }}
        ],
        "healthy_foods": [
            {{
                "name": "food name", 
                "benefit": "how it helps with {skin_disease}",
                "nutrients": "key nutrients that help"
            }}
        ],
        "foods_to_avoid": [
            "food that may worsen {skin_disease}"
        ]
    }}
    
    Focus on evidence-based recommendations. Include 3-5 supplements and 5-7 healthy foods.
    """
    
    try:
        # Send prompt to Gemini
        response = model.generate_content(prompt)
        response_text = response.text.strip()
        
        # Clean up response if it has markdown formatting
        if response_text.startswith('```json'):
            response_text = response_text[7:]
        if response_text.endswith('```'):
            response_text = response_text[:-3]
        
        # Parse JSON response
        recommendations = json.loads(response_text)
        
        # Add disclaimer
        recommendations['disclaimer'] = "This is for educational purposes only. Consult a healthcare professional before starting any supplements."
        
        return recommendations
        
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse JSON: {e}")
        return {"error": "Failed to parse AI response"}
    except Exception as e:
        logger.error(f"Error getting recommendations: {e}")
        return {"error": str(e)}

@app.route('/')
def home():
    return jsonify({
        'message': 'Simple Skin Disease Recommendation API',
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
        if not data or 'skin_disease' not in data:
            return jsonify({'error': 'Please provide skin_disease in request body'}), 400
        
        skin_disease = data['skin_disease'].strip()
        
        if not skin_disease:
            return jsonify({'error': 'skin_disease cannot be empty'}), 400
        
        # Get recommendations from Gemini
        logger.info(f"Getting recommendations for: {skin_disease}")
        recommendations = get_skin_disease_recommendations(skin_disease)
        
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