import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '../types/user'
import type {UserInfo} from '../types'
import authService from '../services/auth'
import { userSettingsApi } from '../services/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const userInfo = ref<UserInfo | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  const isAuthenticated = computed(() => !!user.value)
  const userDisplayName = computed(() => user.value?.displayName || user.value?.email || 'User')

  const initAuth = async () => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        user.value = JSON.parse(storedUser)
        
        if (user.value && user.value.id) {
          localStorage.setItem('userId', user.value.id.toString())
        }
        
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
      if (response.user && response.user.token) {
        localStorage.setItem('token', response.user.token)
      }
      
      if (response.user && response.user.id) {
        localStorage.setItem('userId', response.user.id.toString())
      }
      
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
      await authService.loginWithGoogle()
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
      return response.success;
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
      userInfo.value = null
      localStorage.removeItem('user')
      localStorage.removeItem('token')
      localStorage.removeItem('userId')
      
      window.location.href = '/login'
    }
  }
  
  const updateProfileImage = async (file: File) => {
    loading.value = true
    error.value = null
    
    try {
      const result = await userSettingsApi.uploadProfileImage(file)
      
      if (result.success) {
        const baseURL = import.meta.env.VITE_API_URL || '';
        
        if (userInfo.value) {
          userInfo.value = {
            ...userInfo.value,
            photoURL: result.photoURL || `${baseURL}/users/profile/profile-image/${user.value?.id}`
          }
        }
        
        if (user.value) {
          user.value = {
            ...user.value,
            photoURL: result.photoURL || `${baseURL}/users/profile/profile-image/${user.value.id}`
          }
          localStorage.setItem('user', JSON.stringify(user.value))
          
          if (user.value.id) {
            localStorage.setItem('userId', user.value.id.toString())
          }
        }
        
        return true
      } else {
        error.value = result.error || 'Failed to update profile image'
        return false
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to update profile image'
      return false
    } finally {
      loading.value = false
    }
  }
  
  return {
    user,
    userInfo,
    loading,
    error,
    isAuthenticated,
    userDisplayName,
    initAuth,
    loginWithCredentials,
    loginWithGoogle,
    register,
    logout,
    updateProfileImage
  }
})
