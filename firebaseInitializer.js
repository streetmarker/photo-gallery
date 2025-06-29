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

        if (docSnap.exists()) {
            const fileName = docSnap.data().file_name
            var data
            if (env == 'development') {
                data = await fetch(`http://localhost:3000/images/${fileName}`);
            } else {
                data = await fetch(`https://m21photos.web.app/images/${fileName}?v=${Date.now()}`);
            }
            const results = await data.json();
            return results
        } else {
            // docSnap.data() will be undefined in this case
            console.log("No such document!");
            return null
        }

    } catch (error) {
        console.error("Błąd podczas ładowania ścieżek:", error);
    }
}

const getStorageImgsNew = async (folder) => {
    const datas = await loadImagePathsAndOrientations();
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

const getStorageImgs = async (folder, justList) => {

    // var imagesLoc = [];
    var images = [];
    // var loadingImages = {};

    try {

        var res = await getPhotosDb(folder);
        if (justList) {
            var id = 0
            for (const data of res) {
                let obj = {
                    id,
                    itemImageSrc: data.url,
                    thumbnailImageSrc: data.url,
                    alt: 'Image',
                    title: 'Image',
                    isHorizontal: data.isHorizontal
                }
                images.push(obj);
                id++
            }
            return images
        }

        // for (const data of res) {
        //     let url = data.url
        //     images.push(url);
        //     if (!onlyOne) {
        //         loadingImages[url] = true;
        //     }
        //     if (images.length === 4) {
        //         imagesLoc.push({ images: [...images] });
        //         images = [];
        //     }
        // }
        // if (images.length > 0) {
        //     imagesLoc.push({ images: [...images] });
        // }

        // if (onlyOne) {
        //     return imagesLoc[imagesLoc.length - 1].images[imagesLoc[imagesLoc.length - 1].images.length - 1]
        // }
        // return { imagesLoc, loadingImages };

    } catch (error) {
        console.log('Błąd:', error);
        return []
    }
};

const getPhotosDb = async (folder) => {
    const querySnapshot = await getDocs(collection(db, "imgUrls/images/" + folder));
    const data = querySnapshot.docs.map(doc => doc.data());
    return data
}

export { db, env, getStorageImgsNew, getStorageImgs, getPhotosDb }
