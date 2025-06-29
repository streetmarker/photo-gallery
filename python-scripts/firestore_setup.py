import firebase_admin
from firebase_admin import credentials, firestore
import os

# Pobierz pełną ścieżkę do pliku JSON
json_path = os.path.abspath("python-scripts/serviceAccountKey.json")

# Inicjalizacja Firestore
cred = credentials.Certificate(json_path)
firebase_admin.initialize_app(cred)
db = firestore.client()
