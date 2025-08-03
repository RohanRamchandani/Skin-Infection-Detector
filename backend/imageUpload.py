from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import tempfile
from prediction import predict_image

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = './uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/upload', methods=['POST'])
def upload_image():
    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'}), 400

    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    # Simple check
    if not file.filename.lower().endswith(('.png', '.jpg', '.jpeg')):
        return jsonify({'error': 'Only .png, .jpg, .jpeg allowed'}), 400

    # Save file
    with tempfile.NamedTemporaryFile(delete=True, suffix='.jpg') as temp:
        file.save(temp.name)
        
        # Pass the temp file path to your model
        prediction = predict_image(temp.name)

        # After the `with` block, the temp file is deleted automatically!

    print(prediction)
    return jsonify({'message': 'Image received', 'prediction': prediction})
    