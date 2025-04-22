import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useWebSocket } from './websocket'

const isRunning = ref(false)

export const startInterviewReminderService = () => {
  const authStore = useAuthStore()
  const { connect } = useWebSocket()
  
  if (!authStore.isAuthenticated) {
    return
  }
  
  connect()
  
  if (isRunning.value) {
    return
  }
  
  isRunning.value = true
  console.log('Interview reminder service started')
}

export const stopInterviewReminderService = () => {
  isRunning.value = false
  console.log('Interview reminder service stopped')
}
