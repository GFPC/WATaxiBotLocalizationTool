import {createRouter, createWebHistory} from 'vue-router'

export const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/a',
            name: 'home',
            component: () => import('@/pages/Home.vue'),
        },
        {
            path: '/',
            name: 'localization',
            component: () => import('@/pages/LocalizationEditor.vue'),
        }
    ],
})