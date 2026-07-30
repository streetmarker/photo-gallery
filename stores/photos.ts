import { defineStore } from 'pinia'

export interface CategoryInfo {
  id: string;
  label: string;
  icon: string;
  count: number;
}

export const photoStore = defineStore('photo', {
  state: () => ({
    category: 'all', // 'all', 'nature', 'people', 'buildings', 'cars'
    counts: {
      all: 0,
      nature: 0,
      people: 0,
      buildings: 0,
      cars: 0
    } as Record<string, number>,
  }),
  getters: {
    getCategory: (state) => state.category,
    getCategoryCounts: (state) => state.counts,
    activeCategoryLabel: (state) => {
      const map: Record<string, string> = {
        all: 'Wszystkie zdjęcia',
        nature: 'Krajobraz & Natura',
        people: 'Portrety & Ludzie',
        buildings: 'Ulica & Architektura',
        cars: 'Motoryzacja'
      }
      return map[state.category] || 'Galerie'
    }
  },
  actions: {
    setCategory(category: string) {
      this.category = category || 'all'
    },
    setCounts(counts: Record<string, number>) {
      this.counts = { ...this.counts, ...counts }
    }
  },
})