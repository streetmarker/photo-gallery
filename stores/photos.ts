import { defineStore } from 'pinia'

export const photoStore = defineStore('photo', {
    state: () => ({ category: '' }),
    getters: {
      getCategory: (state) => state.category
    },
    actions: {
      setCategory(category: string) {
        this.category = category
      }
    },
  })