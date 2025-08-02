import os
import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras import layers, models
from sklearn.metrics import classification_report, confusion_matrix
import numpy as np

# Paths

DATA_DIR = r'C:\Users\mahme\OneDrive\Documents\GitHub\Skin-Infection-Detector\dataset\balanced_resized_dataset' # Directory containing images
IMG_SIZE = (224, 224)  # Size to which images will be resized
BATCH_SIZE = 32
EPOCHS = 10 # Number of epochs for training
LR = 1e-4  # Learning rate
Unfreezing_Layers = 100 # Number of layers to unfreeze in the base model


# 1. Load Data
train_datagen = ImageDataGenerator(rescale=1./255
                                   , validation_split=0.2
                                   , rotation_range=20
                                   , width_shift_range=0.2
                                   , height_shift_range=0.2
                                   , shear_range=0.15
                                   , zoom_range=0.15
                                   , horizontal_flip=True
                                   , fill_mode='nearest'
                                   )
train_generator = train_datagen.flow_from_directory(
    DATA_DIR,
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    class_mode='categorical',
    subset='training',
    shuffle=True
)

validation_generator = train_datagen.flow_from_directory(
    DATA_DIR,
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    class_mode='categorical',
    subset='validation',
    shuffle=False
)

# 2. Build Model
base_model = MobileNetV2(input_shape= (224,224,3), include_top=False, weights='imagenet')
base_model.trainable = True  # Set the base model to be trainable


for layer in base_model.layers[:-Unfreezing_Layers]:
    layer.trainable = False  # Freeze the base model layers


# Model
model = models.Sequential([
    base_model,
    layers.GlobalAveragePooling2D(),
    layers.Dropout(0.3),
    layers.Dense(train_generator.num_classes, activation='softmax'),
])

model.compile(optimizer=tf.keras.optimizers.Adam(learning_rate=1e-4),
                loss='categorical_crossentropy',
                metrics=['accuracy'])

# 3. Train Model
history = model.fit(
    train_generator,
    epochs=EPOCHS,
    validation_data=validation_generator
)

# Save the model
model.save('skin_infection_detector_model.keras')
print("Model saved as 'skin_infection_detector_model.keras'")

# 4. Evaluate Model

validation_generator.reset()
predictions = model.predict(validation_generator)
y_pred = np.argmax(predictions, axis=1)
y_true = validation_generator.classes
class_labels = list(validation_generator.class_indices.keys())
print(classification_report(y_true, y_pred, target_names=list(class_labels)))


from tensorflow.keras.callbacks import ModelCheckpoint, EarlyStopping

early_stop = EarlyStopping(monitor='val_loss', patience=5, restore_best_weights=True)

history = model.fit(
    train_generator,
    epochs=EPOCHS,
    validation_data=validation_generator,
    callbacks=[early_stop]
)