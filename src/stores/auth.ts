import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '../types/user'
import type { UserInfo, UserSettingsDTO } from '../types'
import authService from '../services/auth'
import { userSettingsApi } from '../services/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const userInfo = ref<UserInfo | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const emailVerified = ref(false)
  
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
      if (response.user && response.user.token) {
        localStorage.setItem('token', response.user.token)
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
  
  const requestEmailVerification = async (email: string) => {
    loading.value = true
    error.value = null
    emailVerified.value = false
    
    try {
      const response = await authService.requestEmailVerification(email)
      return response.success
    } catch (err: any) {
      error.value = err.message || 'Failed to send verification code'
      return false
    } finally {
      loading.value = false
    }
  }
  
  const verifyEmailCode = async (email: string, code: string) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await authService.verifyEmailCode(email, code)
      emailVerified.value = response.success
      return response.success
    } catch (err: any) {
      error.value = err.message || 'Invalid verification code'
      emailVerified.value = false
      return false
    } finally {
      loading.value = false
    }
  }
  
  const register = async (email: string, password: string, displayName: string, verificationCode: string) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await authService.register(email, password, displayName, verificationCode)
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
      
      window.location.href = '/login'
    }
  }
  
  const updateProfileImage = async (file: File) => {
    loading.value = true
    error.value = null
    
    try {
      const updatedUserSettings: UserSettingsDTO = await userSettingsApi.uploadProfileImage(file)
      
      if (userInfo.value && updatedUserSettings.photoURL) {
        userInfo.value = {
          ...userInfo.value,
          photoURL: updatedUserSettings.photoURL
        }
      }
      
      if (user.value && updatedUserSettings.photoURL) {
        user.value = {
          ...user.value,
          photoURL: updatedUserSettings.photoURL
        }
        localStorage.setItem('user', JSON.stringify(user.value))
      }
      return true
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
    emailVerified,
    isAuthenticated,
    userDisplayName,
    initAuth,
    loginWithCredentials,
    loginWithGoogle,
    requestEmailVerification,
    verifyEmailCode,
    register,
    logout,
    updateProfileImage
  }
})
