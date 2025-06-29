import os
import json, glob
from PIL import Image
from datetime import datetime
from firestore_setup import db

def list_file_paths_and_orientations(directory):
    file_info = []
    for root, _, files in os.walk(directory):
        for file in files:
            file_path = os.path.join(root, file)
            relative_path = os.path.relpath(file_path, directory)

            try:
                with Image.open(file_path) as img:
                    orientation = True if img.width > img.height else False
                if "-min" not in relative_path:
                    file_info.append({"path": "assets/"+relative_path.replace("\\", "/"), "isHorizontal": orientation})
            except Exception as e:
                print(f"Nie można przetworzyć obrazu {file_path}: {e}")
                file_info.append({"path": file_path, "isHorizontal": orientation})
    return file_info

script_dir = os.path.dirname(os.path.abspath(__file__))
photos_dir = os.path.abspath(os.path.join(script_dir, "../public/assets"))
# jsonDir = os.path.abspath(os.path.join(script_dir, "../public/images/file_info.json"))

script_dir = os.path.dirname(os.path.abspath(__file__))
json_dir = os.path.abspath(os.path.join(script_dir, "../public/images/"))

# 1️⃣ Usuń stare pliki
for file in glob.glob(os.path.join(json_dir, "file_info*.json")):
    os.remove(file)
    print(f"Usunięto: {file}")

# 2️⃣ Stwórz nową nazwę pliku z timestampem
timestamp = datetime.now().strftime("%Y%m%d%H%M%S")  # Format YYYYMMDDHHMMSS
new_filename = f"file_info_{timestamp}.json"
new_file_path = os.path.join(json_dir, new_filename)

doc_ref = db.collection("conf").document("fileName").set({"file_name":new_filename})
print("Dodano dokument:", doc_ref)

file_info = list_file_paths_and_orientations(photos_dir)

# Zapisz listę obiektów do pliku JSON
with open(new_file_path, "w") as json_file:
    json.dump(file_info, json_file, indent=4)
