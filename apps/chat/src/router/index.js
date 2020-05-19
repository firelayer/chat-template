import Vue from 'vue'
import Router from 'vue-router'
import { auth } from '../firebase'

Vue.use(Router)

export const routes = [{
  path: '/',
  name: 'login',
  component: () => import(/* webpackChunkName: "login" */ '@/pages/initial/login.vue'),
  meta: {
    layout: 'initial',
    redirectIfAuth: true
  }
}, {
  path: '/chat/',
  name: 'chat',
  redirect: { name: 'channel', params: {
    id: 'general' // default channel
  } },
  meta: {
    requiresAuth: true
  }
}, {
  path: '/chat/:id',
  name: 'channel',
  component: () => import(/* webpackChunkName: "channel" */ '@/pages/chat/channel.vue'),
  meta: {
    requiresAuth: true
  }
}, {
  path: '*',
  name: 'error',
  component: () => import(/* webpackChunkName: "error" */ '@/pages/error/index.vue'),
  meta: {
    layout: 'error'
  }
}]

const router = new Router({
  mode: 'history',
  base: process.env.BASE_URL || '/',
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition

    return { x: 0, y: 0 }
  },
  routes
})

let firstRoute = true

/**
 * Before each route update
 */
router.beforeEach((to, from, next) => {
  // ignore first route, let auth middleware handle it
  if (firstRoute) {
    firstRoute = false

    return next()
  }

  const { currentUser } = auth()

  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (currentUser) {
      return next()
    } else {
      return next({
        name: 'login'
      })
    }
  } else {
    if (currentUser && (to.matched.some((record) => record.meta.redirectIfAuth))) {
      return next({
        name: 'chat'
      })
    }
  }

  return next()
})

export default router
