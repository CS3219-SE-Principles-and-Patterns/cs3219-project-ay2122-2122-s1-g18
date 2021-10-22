import Vue from 'vue'
import VueRouter from 'vue-router'
import { SERVER_URI } from '@/constants'
import axios from 'axios'
import authHeader from '@/utils/authHeader'

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
  }, {
    path: '*',
    redirect: '/'
  }]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

router.beforeEach((to, from, next) => {
  if (to.name === 'landing') {
    next()
  } else {
    const apiURL = `${SERVER_URI}/api/users/verify/checkAuth`
    axios.get(apiURL, { headers: authHeader() })
      .then(() => {
        next()
      })
      .catch(() => {
        next({ name: 'landing' })
      })
  }
})

export default router
