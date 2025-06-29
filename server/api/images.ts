import { readdir, readFile } from 'fs/promises';
import { join } from 'path';

export default defineEventHandler(async () => {
    const imagesDir = join(process.cwd(), 'public/images'); // Folder z plikami

    try {
        const files = await readdir(imagesDir); // Pobranie listy plików
        const jsonFile = files.find(file => file.startsWith('file_info') && file.endsWith('.json'));

        if (!jsonFile) {
            return { error: 'Nie znaleziono pliku file_info%.json' };
        }

        const filePath = join(imagesDir, jsonFile);
        const fileContent = await readFile(filePath, 'utf-8');
        const jsonData = JSON.parse(fileContent); // Parsowanie JSON-a

        return jsonData; // Zwracamy zawartość pierwszego znalezionego pliku
    } catch (error) {
        return { error: 'Błąd odczytu pliku: ' + error.message };
    }
});
