// Add global polyfill for SockJS
window.global = window;

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'

import 'vfonts/Lato.css'
import 'vfonts/FiraCode.css'
import 'primeicons/primeicons.css'
import { useAuthStore } from './stores/auth'
import { createDiscreteApi } from 'naive-ui'

const { message, notification, dialog, loadingBar } = createDiscreteApi([
  'message',
  'dialog',
  'notification',
  'loadingBar'
])

window.$message = message
window.$dialog = dialog
window.$notification = notification
window.$loadingBar = loadingBar

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

const authStore = useAuthStore(pinia)

authStore.initAuth().finally(() => {
  app.mount('#app')
})
