from flask import Flask, request, jsonify
import google.generativeai as genai
import json
import os
import logging
from dotenv import load_dotenv

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
if not GEMINI_API_KEY:
    raise ValueError("Please set GEMINI_API_KEY environment variable")

genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-1.5-flash')

app = Flask(__name__)

def get_skin_disease_recommendations(skin_disease, allergies):
    allergy_info = (
        f"\nThe user has the following allergies: {', '.join(allergies)}.\n"
        "Please avoid recommending any supplements or foods that may trigger these allergies."
        if allergies else ""
    )

    prompt = f"""
        You are a licensed medical nutritionist and dermatologist.  
        Only provide supplement and healthy food recommendations for **medically known and evidence-based** treatments for **{skin_disease}** and allergies: {allergies}.  

        ${allergy_info}

        Use only well-known, established medical sources.  
        You have to be sure and accurate with what you are giving us.   
        Do not add any disclaimers or explanations outside the JSON — only the JSON.
        
        Format your response as JSON with this structure:
        {{
            "condition": "{skin_disease}",
            "supplements": [
                {{
                    "name": "supplement name",
                    "benefit": "how it helps with {skin_disease} and/or {allergies}",
                    "dosage": "recommended daily amount"
                }}
            ],
            "healthy_foods": [
                {{
                    "name": "food name", 
                    "benefit": "how it helps with {skin_disease} and/or {allergies}",
                    "nutrients": "key nutrients that help"
                }}
            ],
            "foods_to_avoid": [
                "food that may worsen {skin_disease} and/or {allergies}"
            ]
        }}
        
        Focus on evidence-based recommendations. Include 3-5 supplements and 5-7 healthy foods.
    """
    try:
        response = model.generate_content(prompt)
        response_text = response.text.strip()

        if response_text.startswith('```json'):
            response_text = response_text[7:]
        if response_text.endswith('```'):
            response_text = response_text[:-3]

        recommendations = json.loads(response_text)

        return recommendations

    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse JSON: {e}")
        return {"error": "Failed to parse AI response"}
    except Exception as e:
        logger.error(f"Error getting recommendations: {e}")
        return {"error": str(e)}


@app.route('/recommend', methods=['POST'])
def recommendations():
    data = request.get_json()
    skin_disease = data.get('skin_disease')
    allergies = data.get('allergies', [])

    if not skin_disease:
        return jsonify({"error": "skin_disease is required"}), 400

    result = get_skin_disease_recommendations(skin_disease, allergies)
    return jsonify(result)


if __name__ == '__main__':
    app.run(debug=True)
