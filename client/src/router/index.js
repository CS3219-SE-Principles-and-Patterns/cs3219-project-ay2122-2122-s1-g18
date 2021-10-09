import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import RoomList from '../views/RoomList'
import AddRoom from '../views/AddRoom'
import JoinRoom from '../views/JoinRoom'
import ChatRoom from '../views/ChatRoom'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/signup',
    name: 'signup',
    component: () => import('../views/Signup')
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/Login')
  },
  {
    path: '/main',
    name: 'main',
    component: () => import('../views/Main')
  },
  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  },
  {
    path: '/room-list',
    name: 'RoomList',
    component: RoomList
  },
  {
    path: '/add-room',
    name: 'AddRoom',
    component: AddRoom
  },
  {
    path: '/join-room/:id',
    name: 'JoinRoom',
    component: JoinRoom
  },
  {
    path: '/chat-room/:id/:nickname',
    name: 'ChatRoom',
    component: ChatRoom
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
