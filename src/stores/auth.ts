import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '../types/user'
import authService from '../services/auth'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  const isAuthenticated = computed(() => !!user.value)
  const userDisplayName = computed(() => user.value?.displayName || user.value?.email || 'User')

  const initAuth = async () => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        user.value = JSON.parse(storedUser)
        await authService.validateToken()
      } catch (err) {
        logout()
      }
    }
  }
  
  const loginWithCredentials = async (email: string, password: string) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await authService.loginWithCredentials(email, password)
      user.value = response.user
      localStorage.setItem('user', JSON.stringify(response.user))
      return true
    } catch (err: any) {
      error.value = err.message || 'Login failed'
      return false
    } finally {
      loading.value = false
    }
  }
  
  const loginWithGoogle = async () => {
    loading.value = true
    error.value = null
    
    try {
      const response = await authService.loginWithGoogle()
      user.value = response.user
      localStorage.setItem('user', JSON.stringify(response.user))
      return true
    } catch (err: any) {
      error.value = err.message || 'Google login failed'
      return false
    } finally {
      loading.value = false
    }
  }
  
  const register = async (email: string, password: string, displayName: string) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await authService.register(email, password, displayName)
      user.value = response.user
      localStorage.setItem('user', JSON.stringify(response.user))
      return true
    } catch (err: any) {
      error.value = err.message || 'Registration failed'
      return false
    } finally {
      loading.value = false
    }
  }
  
  const logout = async () => {
    try {
      await authService.logout()
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      user.value = null
      localStorage.removeItem('user')
    }
  }
  
  return {
    user,
    loading,
    error,
    isAuthenticated,
    userDisplayName,
    initAuth,
    loginWithCredentials,
    loginWithGoogle,
    register,
    logout
  }
})
