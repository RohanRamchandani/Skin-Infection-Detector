import os
import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications import EfficientNetB0
from tensorflow.keras.callbacks import ModelCheckpoint, ReduceLROnPlateau
from tensorflow.keras import layers, models
from sklearn.metrics import classification_report
import numpy as np
from tensorflow.keras.layers import GlobalAveragePooling2D, Dropout, Dense
from tensorflow.keras.models import Model
from tensorflow.keras.layers import Multiply, Reshape

# =================== CONFIG ===================
DATA_DIR = r'dataset\balanced_resized_dataset'
IMG_SIZE = (224, 224)
BATCH_SIZE = 32
EPOCHS = 20
LR = 1e-4
UNFREEZE_LAYERS = 100
# ==============================================


def channel_attention(input_feature):
    channel = input_feature.shape[-1]
    gap = GlobalAveragePooling2D()(input_feature)
    dense_1 = Dense(channel // 8, activation='relu')(gap)
    dense_2 = Dense(channel, activation='sigmoid')(dense_1)
    scale = Multiply()([input_feature, Reshape((1, 1, channel))(dense_2)])
    return scale


print("\033[96m[INFO] Loading and augmenting data...\033[0m")




train_datagen = ImageDataGenerator(
    rescale=1./255,
    validation_split=0.2,
    rotation_range=360,  # Full rotation (lesions can appear at any angle)
    width_shift_range=0.2,
    height_shift_range=0.2,
    shear_range=0.15,
    zoom_range=[0.8, 1.2],  # Zoom in/out to focus on texture
    horizontal_flip=True,
    vertical_flip=True,
    brightness_range=[0.7, 1.3],  # Critical for varying lighting conditions
    channel_shift_range=50,  # Simulate color variations in skin tones
    fill_mode='reflect'  # Better for lesion borders than 'nearest'
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

num_classes = train_generator.num_classes

print(f"\033[94m[INFO] Number of classes detected: {num_classes}\033[0m")

# =================== BUILD MODEL ===================
print("\033[96m[INFO] Building model...\033[0m")

base_model = EfficientNetB0(input_shape=(224, 224, 3), include_top=False, weights=None)
base_model.trainable = True

for layer in base_model.layers[:-UNFREEZE_LAYERS]:
    layer.trainable = False

x = channel_attention(base_model.output)
x = GlobalAveragePooling2D()(x)
x = Dropout(0.3)(x)

outputs = Dense(num_classes, activation='softmax')(x)

model = Model(inputs=base_model.input, outputs=outputs)

model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=LR),
    loss='categorical_crossentropy',
    metrics=['accuracy']
)

# =================== CALLBACKS ===================
print("\033[96m[INFO] Setting up callbacks...\033[0m")

reduce_lr = ReduceLROnPlateau(
    monitor='val_loss', factor=0.5, patience=4, min_lr=1e-6, verbose=1
)

checkpoint_loss = ModelCheckpoint(
    'model_best_val_loss.keras',
    monitor='val_loss',
    save_best_only=True,
    mode='min',
    verbose=1
)

checkpoint_acc = ModelCheckpoint(
    'model_best_val_accuracy.keras',
    monitor='val_accuracy',
    save_best_only=True,
    mode='max',
    verbose=1
)

checkpoint_all = ModelCheckpoint(
    filepath='checkpoints/epoch_{epoch:02d}.keras',
    save_freq='epoch',
    verbose=1
)

# =================== TRAINING ===================
print("\033[92m[STARTING TRAINING]\033[0m")
history = model.fit(
    train_generator,
    epochs=EPOCHS,
    validation_data=validation_generator,
    callbacks=[reduce_lr, checkpoint_loss, checkpoint_acc]
)

# Save final model manually
final_model_path = 'model_final_epoch.keras'
model.save(final_model_path)
print(f"\033[92m[SAVED] Final epoch model saved as '{final_model_path}'\033[0m")

# =================== EVALUATION ===================
print("\n\033[96m[INFO] Evaluating model...\033[0m")
validation_generator.reset()
predictions = model.predict(validation_generator)
y_pred = np.argmax(predictions, axis=1)
y_true = validation_generator.classes
class_labels = list(validation_generator.class_indices.keys())

print("\033[94m[CLASSIFICATION REPORT]\033[0m")
print(classification_report(y_true, y_pred, target_names=class_labels))

# =================== SUMMARY ===================
print("\n\033[93m[SUMMARY]\033[0m")
print("✓ Best model by val_loss: model_best_val_loss.keras")
print("✓ Best model by val_accuracy: model_best_val_accuracy.keras")
print(f"✓ Final model after {EPOCHS} epochs: {final_model_path}")
