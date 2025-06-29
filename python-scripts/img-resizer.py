import os
from PIL import Image
from pathlib import Path

def check_min_path(sciezka: str) -> bool:
    sciezka_min = Path(sciezka).with_stem(Path(sciezka).stem + '-min')
    return sciezka_min.exists()

def resize_webp_images(directory, scale_factor=0.2):
    """Resize all .webp images in directory and subdirectories to 20% of their original dimensions, saving with '-min' suffix."""
    
    for root, _, files in os.walk(directory):
        for file_name in files:
            if file_name.lower().endswith('.webp'):
                file_path = os.path.join(root, file_name)
                if not check_min_path(file_path) and "-min" not in file_path:
                    # Create a new file name with '-min' before the extension
                    file_name_no_ext, file_ext = os.path.splitext(file_name)
                    output_file_name = f"{file_name_no_ext}-min{file_ext}"
                    output_path = os.path.join(root, output_file_name)
                    
                    try:
                        # Open the image and get its current size
                        with Image.open(file_path) as img:
                            original_width, original_height = img.size
                            
                            # Calculate new dimensions
                            new_width = int(original_width * scale_factor)
                            new_height = int(original_height * scale_factor)
                            
                            # Resize the image using LANCZOS filter for high quality
                            resized_img = img.resize((new_width, new_height), Image.LANCZOS)
                            
                            # Save the resized image to the new file path with '-min' suffix
                            resized_img.save(output_path, "WEBP")
                            
                            print(f"Resized '{file_name}' to {new_width}x{new_height} pixels and saved as '{output_file_name}'.")
                    
                    except Exception as e:
                        print(f"Error resizing '{file_name}': {e}")

script_dir = os.path.dirname(os.path.abspath(__file__))
directory = os.path.abspath(os.path.join(script_dir, "../public/assets"))

# Uruchomienie funkcji dla wszystkich plików .webp w katalogu i podkatalogach
if __name__ == "__main__":
    resize_webp_images(directory)
