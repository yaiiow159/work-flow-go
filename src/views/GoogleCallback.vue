<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMessage, NCard, NSpin } from 'naive-ui'
import { useAuthStore } from '../stores/auth'
import authService from '../services/auth'

const router = useRouter()
const route = useRoute()
const message = useMessage()
const authStore = useAuthStore()

onMounted(async () => {
  try {
    const code = route.query.code as string
    
    if (!code) {
      throw new Error('No authorization code received from Google')
    }
    
    const response = await authService.handleGoogleCallback(code)
    
    authStore.user = response.user
    localStorage.setItem('user', JSON.stringify(response.user))
    
    message.success('Google login successful')
    
    const redirectPath = route.query.redirect as string || '/'
    router.replace(redirectPath)
  } catch (error: any) {
    console.error('Google callback error:', error)
    message.error(error.message || 'Google authentication failed')
    router.replace('/login')
  }
})
</script>

<template>
  <div class="callback-container">
    <n-card title="Processing Login" class="callback-card">
      <div class="loading-container">
        <n-spin size="large" />
        <p>Completing your Google login...</p>
      </div>
    </n-card>
  </div>
</template>

<style scoped>
.callback-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
}

.callback-card {
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
