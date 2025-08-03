import tensorflow as tf
import numpy as np
from tensorflow.keras.utils import load_img, img_to_array

# Hardcoded class labels (ensure this order matches your training data)
CLASS_LABELS = {
    0: "BCC",
    1: "Eczema",
    2: "Melanoma",
    3: "atopic",
    4: "bkl",
    5: "fungal",
    6: "nevi",
    7: "psoriasis",
    8: "seborrheic",
    9: "warts"
}

# --- Load model once globally (efficient for server use) ---
MODEL_PATH = 'sample-model.keras'
IMG_SIZE = (224, 224)
model = tf.keras.models.load_model(MODEL_PATH)

def predict_image(image_path):
    """
    Predict the class of a skin disease image using the trained model.
    
    Args:
        image_path (str): Path to the input image.
    
    Returns:
        dict: {
            'predicted_class': str,
            'confidence': float,
            'class_probabilities': dict
        }
    """
    # Load and preprocess image
    img = load_img(image_path, target_size=IMG_SIZE)
    img_array = img_to_array(img) / 255.0
    img_array = np.expand_dims(img_array, axis=0)

    # Predict
    predictions = model.predict(img_array)
    predicted_index = np.argmax(predictions[0])
    confidence = float(predictions[0][predicted_index])

    # Build class probabilities
    class_probs = {
        CLASS_LABELS.get(i, f"Class {i}"): float(prob)
        for i, prob in enumerate(predictions[0])
    }

    return {
        "predicted_class": CLASS_LABELS.get(predicted_index, f"Class {predicted_index}"),
        "confidence": confidence,
        "class_probabilities": class_probs
    }
