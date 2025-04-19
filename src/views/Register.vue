<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { 
  NCard, 
  NForm, 
  NFormItem, 
  NInput, 
  NButton, 
  NSpace,
  useMessage
} from 'naive-ui'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const message = useMessage()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const displayName = ref('')
const loading = ref(false)

const handleRegister = async () => {
  if (!email.value || !password.value || !confirmPassword.value || !displayName.value) {
    message.error('Please fill in all fields')
    return
  }
  
  if (password.value !== confirmPassword.value) {
    message.error('Passwords do not match')
    return
  }
  
  if (password.value.length < 6) {
    message.error('Password must be at least 6 characters')
    return
  }
  
  loading.value = true
  const success = await authStore.register(email.value, password.value, displayName.value)
  loading.value = false
  
  if (success) {
    message.success('Registration successful')
    router.push('/')
  }
}

const goToLogin = () => {
  router.push('/login')
}
</script>

<template>
  <div class="register-container">
    <n-card title="Register" class="register-card">
      <n-form>
        <n-form-item label="Display Name" required>
          <n-input v-model:value="displayName" placeholder="Enter your name" />
        </n-form-item>
        
        <n-form-item label="Email" required>
          <n-input v-model:value="email" placeholder="Enter your email" />
        </n-form-item>
        
        <n-form-item label="Password" required>
          <n-input
            v-model:value="password"
            type="password"
            placeholder="Enter your password"
          />
        </n-form-item>
        
        <n-form-item label="Confirm Password" required>
          <n-input
            v-model:value="confirmPassword"
            type="password"
            placeholder="Confirm your password"
            @keyup.enter="handleRegister"
          />
        </n-form-item>
        
        <n-space vertical>
          <n-button
            type="primary"
            block
            :loading="loading"
            @click="handleRegister"
          >
            Register
          </n-button>
          
          <n-button text @click="goToLogin">
            Already have an account? Login
          </n-button>
        </n-space>
      </n-form>
    </n-card>
  </div>
</template>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
}

.register-card {
  width: 100%;
  max-width: 400px;
}
</style>
