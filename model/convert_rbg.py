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