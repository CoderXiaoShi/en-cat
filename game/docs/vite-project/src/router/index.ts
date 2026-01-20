import { createRouter, createWebHashHistory } from 'vue-router'
import Game from '@/components/Game/index.vue'
import Settings from '@/views/Settings.vue'

export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'game', component: Game },
    { path: '/settings', name: 'settings', component: Settings },
  ],
})

