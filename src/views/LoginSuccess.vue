<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage, NCard, NSpin } from 'naive-ui'
import { useAuthStore } from '../stores/auth'
import axiosInstance from '../services/axiosInstance'
import { userApi } from "../services/api";
import type { User } from '../types/user'

const router = useRouter()
const message = useMessage()
const authStore = useAuthStore()

onMounted(async () => {
  try {
    const hash = window.location.hash
    const token = new URLSearchParams(hash.substring(1)).get('token')
    
    if (!token) {
      throw new Error('No authentication token received')
    }

    localStorage.setItem('token', token)
    axiosInstance.defaults.headers.Authorization = `Bearer ${token}`

    const response = await userApi.getCurrentUser()

    if (!response.data) {
      throw new Error('No user data received from authentication')
    }

    const responseData = response.data;
    
    const userData: User = {
      id: responseData.id,
      email: responseData.email,
      displayName: responseData.name || undefined,
      authProvider: 'google' as const,
      token: token
    }

    authStore.user = userData
    localStorage.setItem('user', JSON.stringify(userData))
    
    message.success('Login successful')
    router.replace('/')
  } catch (error: any) {
    console.error('Login error:', error)
    message.error(error.message || 'Authentication failed')
    router.replace('/login')
  }
})
</script>

<template>
  <div class="login-success-container">
    <n-card title="Login Successful" class="login-success-card">
      <div class="loading-container">
        <n-spin size="large" />
        <p>Completing your login process...</p>
      </div>
    </n-card>
  </div>
</template>

<style scoped>
.login-success-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
}

.login-success-card {
  width: 100%;
  max-width: 400px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
</style>
