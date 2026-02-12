import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { inject } from '@vercel/analytics';
import router from './router';
import './style.css';
import App from './App.vue';

inject();

const app = createApp(App);

app.use(createPinia());
app.use(router);

app.mount('#app');
