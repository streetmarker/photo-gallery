<template>
    <Toast style="max-width: 50%;" />
    <Card style="margin: 1rem 0; background-color: lightgray;">
        <template #title>Zostaw komentarz</template>
        <template #content>
            <p class="m-0">
                <FloatLabel variant="in">
                    <Textarea id="in_label" v-model="username" rows="1" cols="30" style="resize: none" />
                    <label for="in_label">Imię</label>
                </FloatLabel>
                <FloatLabel variant="in">
                    <Textarea id="in_label" v-model="comment" rows="2" cols="30" style="resize: none" />
                    <label for="in_label">Komentarz</label>
                </FloatLabel>
            </p>
            <div class="card flex justify-center">
                <Button @click="send(username, comment)" label="Wyślij"
                    style="color: whitesmoke  ;background: whitesmoke ; border: 1px solid whitesmoke; color: black;" />
            </div>
        </template>
    </Card>

</template>

<script setup>
import Toast from 'primevue/toast';
import Card from 'primevue/card';
import FloatLabel from 'primevue/floatlabel';
import Textarea from 'primevue/textarea';
import Button from 'primevue/button';
import { ref } from 'vue';
import { db } from "../firebaseInitializer";
import { collection, addDoc } from "firebase/firestore";
import { useToast } from "primevue/usetoast";
// const { firebase } = useNuxtApp();
// const db = firebase.db.currentUser;

const toast = useToast();

const username = ref('');
const comment = ref('');
// db._databaseId.projectId = "m21photos"; // QUICK FIX

const send = async (usernameIn, commentIn) => {
    if (!commentIn) {
        toast.add({ severity: 'error', summary: 'Nie udało się', detail: 'Proszę dodaj komentarz :)', life: 3000 });
    } else {
        let data = {
            username: usernameIn,
            comment: commentIn,
            date: new Date()
        }
        var res = await addDoc(collection(db, "comments"), data);
        if (res.id) {
            toast.add({ severity: 'success', summary: 'Udało się!', detail: 'Dodano komentarz, dzięki :)', life: 3000 });
        }
        username.value = '';
        comment.value = '';
    }
}
</script>
