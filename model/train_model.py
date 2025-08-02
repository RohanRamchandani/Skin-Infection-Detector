import os
import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras import layers, models
from sklearn.metrics import classification_report, confusion_matrix

# Paths

DATA_DIR = r'C:\Users\mahme\OneDrive\Documents\GitHub\Skin-Infection-Detector\dataset\balanced_resized_dataset' # Directory containing images
IMG_SIZE = (224, 224)  # Size to which images will be resized
BATCH_SIZE = 32
EPOCHS = 10 # Number of epochs for training

# 1. Load Data
train_datagen = ImageDataGenerator(rescale=1./255, validation_split=0.2)
train_generator = train_datagen.flow_from_directory(
    DATA_DIR,
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    class_mode='categorical',
    subset='training'
)

validation_generator = train_datagen.flow_from_directory(
    DATA_DIR,
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    class_mode='categorical',
    subset='validation'
)

# 2. Build Model
base_model = MobileNetV2(input_shape= (224,224,3), include_top=False, weights='imagenet')
base_model.trainable = False  # Freeze the base model

# Model
model = models.Sequential([
    base_model,
    layers.GlobalAveragePooling2D(),
    layers.Dropout(0.3),
    layers.Dense(train_generator.num_classes, activation='softmax'),
])

model.compile(optimizer='adam',
                loss='categorical_crossentropy',
                metrics=['accuracy'])

# 3. Train Model
history = model.fit(
    train_generator,
    epochs=EPOCHS,
    validation_data=validation_generator
)

# Save the model
model.save('skin_infection_detector_model.h5')
print("Model saved as 'skin_infection_detector_model.h5'")

# 4. Evaluate Model

validation_generator.reset()
predictions = model.predict(validation_generator)
y_pred = predictions.argmax(axis=1)
y_true = validation_generator.classes
class_labels = list(validation_generator.class_indices.keys())
print(classification_report(y_true, y_pred, target_names=class_labels))

