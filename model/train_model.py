import os
import tensorflow as tf
from ternsorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras import layers, models
from sklearn.metrics import classification_report, confusion_matrix

# Paths

DATA_DIR = 'C:\Users\mahme\OneDrive\Documents\GitHub\Skin-Infection-Detector\dataset\balanced_resized_dataset' # Directory containing images
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
