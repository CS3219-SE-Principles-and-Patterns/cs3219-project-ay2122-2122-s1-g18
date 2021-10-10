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
}, {
  path: '/matching',
  name: 'matching',
  component: () => import('../views/Matching')
}, {
  path: '/room-list',
  name: 'roomlist',
  component: () => import('../views/RoomList')
}, {
  path: '/add-room',
  name: 'addroom',
  component: () => import('../views/AddRoom')
}, {
  path: '/join-room/:id',
  name: 'joinroom',
  component: () => import('../views/JoinRoom')
}, {
  path: '/coding-room/:id/:name',
  name: 'codingroom',
  component: () => import('../views/CodingRoom')
}]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
