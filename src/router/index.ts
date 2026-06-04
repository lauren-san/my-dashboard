import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import RegionalPerformanceView from '../views/RegionalPerformanceView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: HomeView,
    },
    {
      path: '/Regional Performance',
      alias: ['/regional-performance'],
      name: 'regional-performance',
      component: RegionalPerformanceView,
    },
  ],
})

export default router
