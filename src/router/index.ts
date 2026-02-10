import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/Home.vue')
    },
    {
      path: '/quiz',
      name: 'quiz',
      component: () => import('../views/Quiz.vue')
    },
    {
      path: '/results',
      name: 'results',
      component: () => import('../views/Results.vue')
    }
  ]
});

export default router;
