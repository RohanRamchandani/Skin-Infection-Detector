import google.generativeai as genai
import json
import os
import logging
import re

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

from dotenv import load_dotenv
load_dotenv()

# Configuration - Set your Gemini API key as environment variable
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
if not GEMINI_API_KEY:
    raise ValueError("Please set GEMINI_API_KEY environment variable")

# Configure Gemini
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-1.5-flash')

def get_skin_disease_recommendations(skin_disease, allergies):
    """
    Simple function to prompt Gemini AI for skin disease recommendations
    """
    
    # Create a simple, focused prompt
    prompt = f"""
    Please provide supplement and healthy food recommendations for {skin_disease} and {allergies}.
    
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
        # Send prompt to Gemini
        response = model.generate_content(prompt)
        response_text = response.text.strip()
        
        # Clean up response if it has markdown formatting
        if response_text.startswith('```json'):
            response_text = response_text[7:]
        if response_text.endswith('```'):
            response_text = response_text[:-3]
        
        match = re.search(r'\{.*\}', response_text, re.DOTALL)
        if match:
            response_text = match.group(0)
        else:
            logger.error("No JSON found in response")
            return {"error": "No valid JSON found in AI response"}
        
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