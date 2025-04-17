import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    meta: { title: 'WorkFlowGo - Dashboard' }
  },
  {
    path: '/interviews',
    name: 'Interviews',
    component: () => import('../views/Interviews.vue'),
    meta: { title: 'Interviews' }
  },
  {
    path: '/interviews/new',
    name: 'NewInterview',
    component: () => import('../views/InterviewForm.vue'),
    meta: { title: 'Add New Interview' }
  },
  {
    path: '/interviews/:id',
    name: 'InterviewDetail',
    component: () => import('../views/InterviewDetail.vue'),
    meta: { title: 'Interview Details' }
  },
  {
    path: '/interviews/:id/edit',
    name: 'EditInterview',
    component: () => import('../views/InterviewForm.vue'),
    meta: { title: 'Edit Interview' }
  },
  {
    path: '/documents',
    name: 'Documents',
    component: () => import('../views/Documents.vue'),
    meta: { title: 'Documents' }
  },
  {
    path: '/calendar',
    name: 'Calendar',
    component: () => import('../views/Calendar.vue'),
    meta: { title: 'Interview Calendar' }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../views/Settings.vue'),
    meta: { title: 'Settings' }
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

router.beforeEach((to, _from, next) => {
  document.title = to.meta.title as string || 'WorkFlowGo'
  next()
})

export default router
