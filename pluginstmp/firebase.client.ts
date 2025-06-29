import { initializeApp } from 'firebase/app'
import { getFirestore, getDoc, doc, Firestore } from "firebase/firestore";

export default defineNuxtPlugin(() => {
      const config = useRuntimeConfig()

    const firebaseConfig = {
        apiKey: config.public.firebaseConfig.apiKey,
        authDomain: config.public.firebaseConfig.authDomain,
        projectId: config.public.firebaseConfig.projectId,
        storageBucket: config.public.firebaseConfig.storageBucket,
        messagingSenderId: config.public.firebaseConfig.messagingSenderId,
        appId: config.public.firebaseConfig.appId,
        measurementId: config.public.firebaseConfig.measurementId
      }

    const app = initializeApp(firebaseConfig)
    
    const db = getFirestore(app)
    const env = process.env.NODE_ENV;

    async function loadImagePathsAndOrientations(db: Firestore) {
        try {
            const docRef = doc(db, "conf", "fileName");
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                
                const fileName = docSnap.data().file_name
                var data
                if (env == 'development') {
                    data = await fetch(`http://localhost:3000/images/${fileName}`);
                } else {
                    data = await fetch(`https://m21photos.web.app/images/${fileName}`);
                }
                const results = await data.json();
                return results
            } else {
                 
                console.log("No such document!");
                return null
            }

        } catch (error) {
            console.error("Błąd podczas ładowania ścieżek:", error);
        }
    }

    const getStorageImgsNew = async (db: any, folder: any) => {
        const datas = await loadImagePathsAndOrientations(db);
        var images = [];
        var id = 0
        for (const data of datas) {
            if (!!folder && data.path.includes(folder)) {
                let thumbnail = data.path.replace(/\.webp$/, "-min.webp");
                let obj = {
                    id,
                    itemImageSrc: data.path,
                    thumbnailImageSrc: thumbnail,
                    alt: 'Image',
                    title: 'Image',
                    isHorizontal: data.isHorizontal
                }
                images.push(obj);
            }
            id++
        }
        return images
    }

    return {
        provide: {
            firebase: {
                app,
                db,
                getStorageImgsNew
            }
        }
    }
})
