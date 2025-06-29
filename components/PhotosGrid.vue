<template>
    <div class="hero-text">
        <h1 style="font-size:50px; text-align: left;">Photos from times I took my camera with me</h1>
        <h3 style="text-align: right;"><i>Enjoy, MJ</i></h3>
    </div>

    <!-- Modal -->
    <div v-if="isModalOpen" class="modal" @click="closeModal">
        <img :src="modalImgSrc" :alt="modalImgAlt" class="modal-content" />
    </div>

    <div v-if="displayedBatches != []" class="grid-container">
        <div v-for="(batch, batchIndex) in displayedBatches" :key="batchIndex" class="batch-container"
            :ref="setBatchRef">
            <div v-for="(image, index) in batch.verticalImages" :key="index" class="col-span-4">
                <img :class="{ 'visible': visibleImages[index] }" ref="imgRefs" :src="image.thumbnailImageSrc"
                    :alt="image.alt" class="vertical-image" @click="openModal(image.itemImageSrc)" />
            </div>
            <div v-if="batch.horizontalImage" class="col-span-12">
                <img :src="batch.horizontalImage.thumbnailImageSrc" :alt="batch.horizontalImage.alt"
                    class="horizontal-image" @click="openModal(batch.horizontalImage.itemImageSrc)" />
            </div>
        </div>
    </div>
    <div ref="observerDiv" class="observer-div"></div>

</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useIntersectionObserver } from '@vueuse/core';

import { db, getStorageImgsNew } from "../firebaseInitializer";
import { collection, addDoc } from "firebase/firestore";

// const { firebase } = useNuxtApp()
// console.log('grid:',firebase);

// const db = firebase.db
// const getStorageImgsNew = firebase.getStorageImgsNew

const store = photoStore();
const envIp = ref("");

const isModalOpen = ref(false);
const modalImgSrc = ref('');
const modalImgAlt = ref('');

const displayedBatches = ref([]);
const batchSize = 6;
const observerDiv = ref(null);
let observer = null;
const batchObservers = new Map();

const imagesHorizontal = ref([])
const imagesVertical = ref([])
const images = ref([])
const visibleImages = ref(new Array(images.value.length).fill(false));
const imgRefs = ref([]);

function loadNextBatch() {
    const loadedVerticals = displayedBatches.value.reduce((acc, batch) => acc + batch.verticalImages.length, 0);
    const loadedHorizontals = displayedBatches.value.length; // Każda paczka dostaje kolejny obraz poziomy

    const verticalImages = imagesVertical.value.slice(loadedVerticals, loadedVerticals + batchSize);
    const horizontalImage = loadedHorizontals < imagesHorizontal.value.length
        ? imagesHorizontal.value[loadedHorizontals]
        : null; // Jeśli skończą się poziome, ustaw na null

    if (verticalImages.length > 0 || horizontalImage) {
        displayedBatches.value.push({ verticalImages, horizontalImage });
        return
    }

    // Jeśli skończyły się pionowe, ale są jeszcze poziome, dodajemy paczki tylko z poziomymi
    if (verticalImages.length === 0 && horizontalImage) {
        displayedBatches.value.push({ verticalImages: [], horizontalImage });
    }

    // Jeśli skończyły się poziome, ale są jeszcze pionowe, dodajemy paczki tylko z pionowymi
    if (horizontalImage === null && verticalImages.length > 0) {
        displayedBatches.value.push({ verticalImages, horizontalImage: null });
    }
}
function clearBatches() {
    // Zresetowanie obiektów obrazów
    displayedBatches.value.forEach((batch) => {
        batch.verticalImages = null;
        batch.horizontalImage = null;
    });
    displayedBatches.value = [];

    // Usuń obserwatory paczek
    batchObservers.forEach((batchObserver) => batchObserver.disconnect());
    batchObservers.clear();
}
function setBatchRef(el, batchIndex) {
    if (el && !batchObservers.has(batchIndex)) {
        const batchObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) {
                    displayedBatches.value[batchIndex] = null;
                    batchObservers.delete(batchIndex);
                }
            });
        });
        batchObserver.observe(el);
        batchObservers.set(batchIndex, batchObserver);
    }
}
const getIPAddress = async () => {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        const ipAddress = data.ip;;
        return ipAddress;
    } catch (error) {
        return 'Błąd przy pobieraniu adresu IP:' + error;
    }
}
const logEntry = async (myIp) => {
    if (process.env.NODE_ENV === "production") {
        let date = new Date();

        function getPosition() {
            return new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        resolve({
                            latLon: position.coords.latitude + " " + position.coords.longitude
                        });
                    },
                    (error) => {
                        reject(error);
                    }
                );
            });
        }

        var position = null;
        var userIp = null
        try {
            // position = await getPosition();
            userIp = await getIPAddress();
        } catch (error) {
        }

        if (userIp != myIp) {

            let data = {
                date: date,
                location: position,
                userAgent: navigator.userAgent || null,
                IP: userIp || null
            };
            await addDoc(collection(db, "entries"), data);
        }
    }
}
function openModal(src, alt = '') {
    modalImgSrc.value = src;
    modalImgAlt.value = alt;
    isModalOpen.value = true;
}
function closeModal() {
    const modalElement = document.querySelector('.modal');

    // Dodajemy klasę fade-out, żeby płynnie zniknęło
    modalElement?.classList.add('fade-out');

    // Czekamy aż animacja zniknięcia się zakończy, potem zamykamy modal
    setTimeout(() => {
        isModalOpen.value = false;
        modalElement?.classList.remove('fade-out'); // Czyścimy klasę po zakończeniu animacji
    }, 300); // Czas animacji fade-out (300ms)
}

watch(() => store.category, async (newValue, oldValue) => {
    if (newValue != oldValue && !!newValue) {
        clearBatches();
        var getStorageImgsRes = await getStorageImgsNew(newValue);
        imagesHorizontal.value = getStorageImgsRes.filter((el) => { return el.isHorizontal === true });
        imagesVertical.value = getStorageImgsRes.filter((el) => { return el.isHorizontal === false });
        images.value = getStorageImgsRes;

        displayedBatches.value = [];
        loadNextBatch();
        
    }
})
onMounted(async () => {
    var getStorageImgsRes = await getStorageImgsNew('nature');

    imagesHorizontal.value = getStorageImgsRes.filter((el) => { return el.isHorizontal === true });
    imagesVertical.value = getStorageImgsRes.filter((el) => { return el.isHorizontal === false });
    images.value = getStorageImgsRes;
    // bcgImage.value = getStorageImgsRes[getStorageImgsRes.length - 1].thumbnailImageSrc.replace("/_nuxt", "");


    loadNextBatch();
    observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            console.log("Ładowanie nowej paczki...");
            loadNextBatch();
        }
    }, {
        rootMargin: '100px',
        threshold: 0.1
    });

    if (observerDiv.value) {
        observer.observe(observerDiv.value);
    }

    const config = useRuntimeConfig();
    const myIp = config.public.VUE_APP_MY_IP;

    envIp.value = myIp;

    logEntry(myIp);

    await nextTick(); // Zapewniamy, że DOM jest gotowy


    imgRefs.value.forEach((img, index) => {
        useIntersectionObserver(img, ([{ isIntersecting }]) => {
            if (isIntersecting) {
                visibleImages.value[index] = true;
            }
        });
    });
});
onUnmounted(() => {
    if (observer && observerDiv.value) {
        observer.unobserve(observerDiv.value);
    }
    batchObservers.forEach((batchObserver) => batchObserver.disconnect()); // Odłącz wszystkie obserwacje paczek
    batchObservers.clear();
});
</script>

<style>
.hero-image {
    display: flex;
    justify-content: center;
    min-width: 40vh;
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
    position: relative;
    height: 60vh;
    margin-bottom: 5px;
}
.hero-text {
    text-align: center;
    font-family: 'FontAwesome';
}
.grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1rem;
    margin-top: 1rem;
}

.col-span-4 {
    grid-column: span 1 / span 1;
    margin: 5%;
    box-shadow: 0 4px 8px 5px rgba(0, 0, 0, 0.2), 0 6px 20px 5px rgba(0, 0, 0, 0.19);
}

.col-span-12 {
    grid-column: span 3 / span 3;
    width: 320%;
    max-width: -webkit-fill-available;
    margin: 5%;
    box-shadow: 0 4px 8px 5px rgba(0, 0, 0, 0.2), 0 6px 20px 5px rgba(0, 0, 0, 0.19);
}

.vertical-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.horizontal-image {
    height: 100%;
    width: 81vh;
    object-fit: cover;
    max-width: -webkit-fill-available;
}

.grid-container {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.batch-container {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
}

.observer-div {
    height: 1px;
}
.col-span-4 img {
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.6s ease-out, transform 0.6s ease-out;
}

.col-span-4 img.visible {
    opacity: 1;
    transform: translateY(0);
}

/* Modal */
.modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.85);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    opacity: 1;
    transition: opacity 0.3s ease-in-out;
}
.modal.fade-out {
    opacity: 0;
}

.modal-content {
    max-width: 90%;
    max-height: 90vh;
    border-radius: 12px;
    box-shadow: 0 0 30px rgba(0, 0, 0, 0.6);
    transition: opacity 0.3s ease;
}
</style>
