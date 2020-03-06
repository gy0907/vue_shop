import Vue from 'vue'
import VueRouter from 'vue-router'

import Home from '../view/Home'
import Welcome from '../components/Welcome'
import Users from '../view/HomeCpns/Users'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    component: () => import('../view/Login')
  },
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [
      {
        path: '/welcome',
        component: Welcome
      },
      {
        path: '/users',
        component: Users
      }
    ]
  }
]

const router = new VueRouter({
  mode: 'history',
  routes
})

router.beforeEach((to,from,next)=>{
  if(to.path==='/login') return next()
  // 有token且不为空就放行
  const token = window.sessionStorage.getItem('token')
  if(!token) return next('/login')
  next()
})

export default router