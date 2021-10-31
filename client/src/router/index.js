import Vue from 'vue'
import VueRouter from 'vue-router'
import { SERVER_URI } from '@/constants'
import axios from 'axios'
import getAuthHeader from '@/utils/authHeader'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'landing',
    component: () => import('../views/Landing')
  }, {
    path: '/home',
    name: 'home',
    component: () => import('../views/Home')
  }, {
    path: '/matching',
    name: 'matching',
    component: () => import('../views/Matching'),
    beforeEnter: (to, from, next) => {
      if (from.name === 'home') {
        next()
      } else {
        next('/home')
      }
    }
  }, {
    path: '/reset/:id/:token',
    name: 'reset',
    component: () => import('../views/Reset')
  }, {
    path: '/coding-room',
    name: 'codingroom',
    component: () => import('../views/CodingRoom'),
    beforeEnter: (to, from, next) => {
      if (from.name === 'matching') {
        next()
      } else {
        next('/home')
      }
    }
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
  if (to.name === 'landing' || to.name === 'reset') {
    next()
  } else {
    const apiURL = `${SERVER_URI}/api/users/verify/checkAuth`
    axios.get(apiURL, { headers: getAuthHeader() })
      .then(() => {
        next()
      })
      .catch(() => {
        next({ name: 'landing' })
      })
  }
})

export default router
