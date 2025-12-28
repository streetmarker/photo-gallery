<script setup>
import Menubar from 'primevue/menubar';
import Badge from 'primevue/badge';
import Button from 'primevue/button';
import Menu from 'primevue/menu';
</script>

<template>
    <div class="menu-container">
        <div class="logo-container">
            <img class="logo" src="../public/logo.webp" alt="logo">
            <h1 class="title">M21Photos</h1>
        </div>
        <div class="card flex justify-center">
            <Button type="button" severity="help" raised label="Categories"  @click="toggle" aria-haspopup="true"
                aria-controls="overlay_menu" />
            <Menu ref="menu" id="overlay_menu" :model="items" :popup="true">
                <template #item="{ item, props, hasSubmenu, root }">
                    <a @click="loadImages(item.value)" v-ripple class="menu-item" v-bind="props.action">
                        <span :class="item.icon" />
                        <span class="ml-2">{{ item.label }}</span>
                        <Badge v-if="item.badge" :class="{ 'ml-auto': !root, 'ml-2': root }" :value="item.badge" />
                        <span v-if="item.shortcut" class="shortcut">{{ item.shortcut }}</span>
                        <i v-if="hasSubmenu"
                            :class="['pi pi-angle-down', { 'pi-angle-down ml-2': root, 'pi-angle-right ml-auto': !root }]"></i>
                    </a>
                </template>
            </Menu>
        </div>
    </div>
</template>
<script>

export default {

    data() {
        return {
            items: [
                {
                    label: 'Categories',
                    items: [
                        {
                            label: 'portraits',
                            icon: 'pi pi-user',
                            value: 'people'
                        },
                        {
                            label: 'nature',
                            icon: 'pi pi-image',
                            value: 'nature'
                        },
                        {
                            label: 'street',
                            icon: 'pi pi-building',
                            value: 'buildings'
                        },
                        {
                            label: 'cars',
                            icon: 'pi pi-car',
                            value: 'cars'
                        }
                    ]
                }
            ]
        };
    },
    mounted() {
        //
    },
    methods: {
        async loadImages(folder) {
            const store = photoStore();
            store.setCategory(folder);
        },
        toggle(event) {
            this.$refs.menu.toggle(event);
        }
    }
};
</script>

<style>
.p-menubar-mobile .p-menubar-root-list {
    display: contents !important;
    position: relative !important;
}

/* .p-menubar {
    border-color: teal !important;
    border-width: 2px !important;
} */
.menu-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    background-color: lightgray;
    padding: 1rem;
    margin-bottom: 1rem;
}

.logo-container {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
}

.logo {
    width: 50px;
    height: 50px;
    border-radius: 100%;
}

.title {
    padding-left: 10px;
    font-size: 1.5rem;
}

/* Przeniesienie pod logo na małych ekranach */
@media (max-width: 768px) {
    .menu-container {
        flex-direction: column;
        align-items: center;
    }

    .logo-container {
        justify-content: center;
        text-align: center;
    }
}
</style>