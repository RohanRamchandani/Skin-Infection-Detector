import os
import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications import EfficientNetB4
from tensorflow.keras.callbacks import ModelCheckpoint, EarlyStopping , ReduceLROnPlateau
from tensorflow.keras import layers, models
from sklearn.metrics import classification_report, confusion_matrix
import numpy as np
from PIL import Image
import os

def convert_to_rgb_images(folder_path):
    for subdir, _, files in os.walk(folder_path):
        for file in files:
            file_path = os.path.join(subdir, file)
            try:
                with Image.open(file_path) as img:
                    if img.mode != 'RGB':
                        print(f"Converting: {file_path}")
                        rgb_img = img.convert('RGB')
                        rgb_img.save(file_path)
            except Exception as e:
                print(f"Failed to process {file_path}: {e}")
convert_to_rgb_images(r'dataset\balanced_resized_dataset')

# Paths

DATA_DIR = r'dataset\balanced_resized_dataset' # Directory containing images
IMG_SIZE = (224, 224)  # Size to which images will be resized
BATCH_SIZE = 32
EPOCHS = 50 # Number of epochs for training
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
base_model = EfficientNetB4(input_shape= (224,224,3), include_top=False, weights='imagenet')
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

model.compile(optimizer=tf.keras.optimizers.Adam(learning_rate=LR),
                loss='categorical_crossentropy',
                metrics=['accuracy'])

early_stop = EarlyStopping(monitor='val_loss', patience=10, restore_best_weights=True, verbose=1)
reduce_lr = ReduceLROnPlateau(monitor='val_loss', factor=0.5, patience=4, min_lr=1e-6, verbose=1)
checkpoint = ModelCheckpoint(
    'best_efficientnet_skin_model.keras',  # Save to file
    monitor='val_loss',
    save_best_only=True,
    verbose=1
)
history = model.fit(
    train_generator,
    epochs=EPOCHS,
    validation_data=validation_generator,
    callbacks=[early_stop, reduce_lr, checkpoint]
)



# 4. Evaluate Model

validation_generator.reset()
predictions = model.predict(validation_generator)
y_pred = np.argmax(predictions, axis=1)
y_true = validation_generator.classes
class_labels = list(validation_generator.class_indices.keys())
print(classification_report(y_true, y_pred, target_names=list(class_labels)))


