import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'

const isRunning = ref(false)

export const startInterviewReminderService = () => {
  const authStore = useAuthStore()
  if (!authStore.isAuthenticated) {
    return
  }
  
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
