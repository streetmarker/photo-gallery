from PIL import Image
import os

def compress_and_convert_image(input_path, output_path, max_size=400 * 1024):
    """Compress and convert an image to WebP format with a maximum size."""
    with Image.open(input_path) as img:
        quality = 100  # Start with maximum quality
        img.save(output_path, "WEBP", quality=quality)

        # Check the size and reduce quality until the target size is met
        while os.path.getsize(output_path) > max_size and quality > 0:
            quality -= 10  # Reduce quality by 10
            img.save(output_path, "WEBP", quality=quality)
            print(f"Trying quality {quality}: {os.path.getsize(output_path) / 1024:.2f} KB")

    print(f"Final size of '{output_path}': {os.path.getsize(output_path) / 1024:.2f} KB")

def convert_all_images_in_folder():
    try:
        script_dir = os.path.dirname(os.path.abspath(__file__))
        assets_dir = os.path.abspath(os.path.join(script_dir, "../public/assets"))

        # assets_dir = os.path.join(script_dir, "../public/assets")
        
        # Iterate through all files in the folder
        for folder in os.listdir(assets_dir):
            for img in os.listdir(os.path.abspath(os.path.join(script_dir, "../public/assets/"+folder))): # refactor
                # Get the file extension
                file_path = os.path.join(script_dir, "../public/assets/"+folder, img)
                file_name_no_ext, file_ext = os.path.splitext(img)

                # Check if the file is in JPG or PNG format
                if file_ext.lower() in [".jpg", ".jpeg", ".png"]:
                    # Specify the output path for the WebP file
                    output_file = os.path.join(script_dir, "../public/assets/"+folder, f"{file_name_no_ext}.webp")

                    # Compress and convert the image to WebP format
                    compress_and_convert_image(file_path, output_file)
                    print(f"Plik '{img}' został przekonwertowany i skompresowany do '{file_name_no_ext}.webp'")

                    # Remove the original file after successful conversion
                    os.remove(file_path)
                    print(f"Plik '{img}' został usunięty.")
    
    except Exception as e:
        print(f"Wystąpił błąd: {e}")

# Run the function to convert all files
if __name__ == "__main__":
    convert_all_images_in_folder()
