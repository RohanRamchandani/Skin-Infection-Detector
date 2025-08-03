# test_prediction.py

from prediction import predict_image

# Path to a local test image (use an actual image path you have!)
image_path = "image.png"

result = predict_image(image_path)

print("Prediction result:")
print(result)