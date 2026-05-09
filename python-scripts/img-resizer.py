import os
from PIL import Image

def resize_webp_images(directory, max_size=(800, 800)):
    """Resize all .webp images in directory using a max dimension constraint, saving with '-min' suffix. Overwrites existing."""
    
    for root, _, files in os.walk(directory):
        for file_name in files:
            if file_name.lower().endswith('.webp') and "-min" not in file_name:
                file_path = os.path.join(root, file_name)
                file_name_no_ext, file_ext = os.path.splitext(file_name)
                output_file_name = f"{file_name_no_ext}-min{file_ext}"
                output_path = os.path.join(root, output_file_name)
                
                try:
                    with Image.open(file_path) as img:
                        img.thumbnail(max_size, Image.LANCZOS)
                        img.save(output_path, "WEBP", quality=85, method=6)
                        print(f"Resized '{file_name}' to {img.size[0]}x{img.size[1]} pixels and saved as '{output_file_name}'.")
                
                except Exception as e:
                    print(f"Error resizing '{file_name}': {e}")

script_dir = os.path.dirname(os.path.abspath(__file__))
directory = os.path.abspath(os.path.join(script_dir, "../public/assets"))

if __name__ == "__main__":
    resize_webp_images(directory)
