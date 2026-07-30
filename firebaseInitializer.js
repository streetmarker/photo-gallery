import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, getDoc, doc } from "firebase/firestore";

const firebaseConfig = {
    apiKey: process.env.VUE_APP_FIREBASE_API_KEY,
    authDomain: process.env.VUE_APP_APP_DOMAIN,
    projectId: process.env.VUE_APP_PROJECT_ID,
    storageBucket: "m21photos.appspot.com",
    messagingSenderId: process.env.VUE_APP_SENDER_ID,
    appId: process.env.VUE_APP_APP_ID,
    measurementId: process.env.VUE_APP_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
db._databaseId.projectId = "m21photos"; // QUICK FIX

const env = process.env.NODE_ENV;

async function loadImagePathsAndOrientations() {
    try {
        const docRef = doc(db, "conf", "fileName");
        const docSnap = await getDoc(docRef);

        let fileName = "file_info_20260506214321.json"; // fallback
        if (docSnap.exists() && docSnap.data().file_name) {
            fileName = docSnap.data().file_name;
        }

        let url;
        if (env === 'development') {
            url = `/images/${fileName}`;
        } else {
            url = `https://m21photos.web.app/images/${fileName}?v=${Date.now()}`;
        }

        try {
            const data = await fetch(url);
            const results = await data.json();
            return results;
        } catch (fetchErr) {
            // Fallback fetch relative if host is custom
            const fallbackData = await fetch(`/images/file_info_20260506214321.json`);
            return await fallbackData.json();
        }

    } catch (error) {
        console.error("Błąd podczas ładowania ścieżek:", error);
        return [];
    }
}

const getStorageImgsNew = async (folder) => {
    const datas = await loadImagePathsAndOrientations();
    const images = [];
    const counts = { all: 0, nature: 0, people: 0, buildings: 0, cars: 0 };

    if (!datas || !Array.isArray(datas)) {
        return { images: [], counts };
    }

    let id = 0;
    for (const data of datas) {
        if (!data || !data.path) continue;

        counts.all++;
        if (data.path.includes('nature')) counts.nature++;
        if (data.path.includes('people')) counts.people++;
        if (data.path.includes('buildings')) counts.buildings++;
        if (data.path.includes('cars')) counts.cars++;

        const isMatch = !folder || folder === 'all' || data.path.includes(folder);
        if (isMatch) {
            let thumbnail = data.path.replace(/\.webp$/, "-min.webp");
            
            let categoryLabel = 'Galeria';
            let categoryKey = 'all';
            if (data.path.includes('nature')) { categoryLabel = 'Natura'; categoryKey = 'nature'; }
            else if (data.path.includes('people')) { categoryLabel = 'Portret'; categoryKey = 'people'; }
            else if (data.path.includes('buildings')) { categoryLabel = 'Ulica'; categoryKey = 'buildings'; }
            else if (data.path.includes('cars')) { categoryLabel = 'Auta'; categoryKey = 'cars'; }

            const fileName = data.path.split('/').pop() || '';
            const cleanTitle = fileName
                .replace(/\.webp$/, '')
                .replace(/\(1\)/g, '')
                .replace(/~/g, ' ')
                .replace(/_/g, ' ')
                .trim();

            let obj = {
                id,
                itemImageSrc: data.path,
                thumbnailImageSrc: thumbnail,
                alt: cleanTitle ? `${categoryLabel} - ${cleanTitle}` : 'Fotografia M21Photos',
                title: cleanTitle || `Fotografia #${id + 1}`,
                category: categoryLabel,
                categoryKey: categoryKey,
                isHorizontal: !!data.isHorizontal
            };
            images.push(obj);
        }
        id++;
    }
    return { images, counts };
};

const getStorageImgs = async (folder, justList) => {
    try {
        const res = await getPhotosDb(folder);
        const images = [];
        if (justList) {
            let id = 0;
            for (const data of res) {
                let obj = {
                    id,
                    itemImageSrc: data.url,
                    thumbnailImageSrc: data.url,
                    alt: 'Fotografia M21Photos',
                    title: 'Fotografia M21Photos',
                    category: folder,
                    isHorizontal: data.isHorizontal
                };
                images.push(obj);
                id++;
            }
            return images;
        }
    } catch (error) {
        console.log('Błąd:', error);
        return [];
    }
};

const getPhotosDb = async (folder) => {
    const querySnapshot = await getDocs(collection(db, "imgUrls/images/" + folder));
    const data = querySnapshot.docs.map(doc => doc.data());
    return data;
};

export { db, env, getStorageImgsNew, getStorageImgs, getPhotosDb };
