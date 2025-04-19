import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    meta: { title: 'WorkFlowGo - Dashboard', requiresAuth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { title: 'Login' }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue'),
    meta: { title: 'Register' }
  },
  {
    path: '/interviews',
    name: 'Interviews',
    component: () => import('../views/Interviews.vue'),
    meta: { title: 'Interviews', requiresAuth: true }
  },
  {
    path: '/interviews/new',
    name: 'NewInterview',
    component: () => import('../views/InterviewForm.vue'),
    meta: { title: 'Add New Interview', requiresAuth: true }
  },
  {
    path: '/interviews/:id',
    name: 'InterviewDetail',
    component: () => import('../views/InterviewDetail.vue'),
    meta: { title: 'Interview Details', requiresAuth: true }
  },
  {
    path: '/interviews/:id/edit',
    name: 'EditInterview',
    component: () => import('../views/InterviewForm.vue'),
    meta: { title: 'Edit Interview', requiresAuth: true }
  },
  {
    path: '/documents',
    name: 'Documents',
    component: () => import('../views/Documents.vue'),
    meta: { title: 'Documents', requiresAuth: true }
  },
  {
    path: '/calendar',
    name: 'Calendar',
    component: () => import('../views/Calendar.vue'),
    meta: { title: 'Interview Calendar', requiresAuth: true }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../views/Settings.vue'),
    meta: { title: 'Settings', requiresAuth: true }
  },
  {
    path: '/oauth2/redirect',
    name: 'LoginSuccess',
    component: () => import('../views/LoginSuccess.vue'),
    meta: { title: 'Login Successful' }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFound.vue'),
    meta: { title: 'Page Not Found' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, _from, next) => {
  document.title = to.meta.title as string || 'WorkFlowGo'
  
  if (to.matched.some(record => record.meta.requiresAuth)) {
    const authStore = useAuthStore()
    
    if (!authStore.user) {
      await authStore.initAuth()
    }
    
    if (!authStore.isAuthenticated) {
      next({ name: 'Login', query: { redirect: to.fullPath } })
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router
