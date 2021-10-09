import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [{
  path: '/home',
  name: 'home',
  component: () => import('../views/Home')
}, {
  path: '/signup',
  name: 'signup',
  component: () => import('../views/Signup')
}, {
  path: '/login',
  name: 'login',
  component: () => import('../views/Login')
}]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
