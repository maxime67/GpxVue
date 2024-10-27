import { createRouter, createWebHistory } from 'vue-router'
import MainComponent from '../components/MainComponent.vue'
import TestComponent from '../components/ElecComponent.vue'

const routes = [
    {
        path: '/',
        name: 'Home',
        component: MainComponent
    },
    {
        path: '/test',
        name: 'Test',
        component: TestComponent
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router