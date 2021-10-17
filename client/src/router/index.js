import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'landing',
    component: () => import('../views/Landing')
  },
  {
    path: '/home',
    name: 'home',
    component: () => import('../views/Home')
  }, {
    path: '/matching',
    name: 'matching',
    component: () => import('../views/Matching')
  }, {
    path: '/coding-room',
    name: 'codingroom',
    component: () => import('../views/CodingRoom')
  }]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
