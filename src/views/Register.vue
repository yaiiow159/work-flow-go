<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { 
  NCard, 
  NForm, 
  NFormItem, 
  NInput, 
  NButton, 
  NSpace,
  NInputGroup,
  NCountdown,
  useMessage,
  useDialog
} from 'naive-ui'
import { useAuthStore } from '../stores/auth'
import { handleApiError } from '../utils/errorHandler'

const router = useRouter()
const message = useMessage()
const dialog = useDialog()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const displayName = ref('')
const verificationCode = ref('')
const loading = ref(false)
const verifyLoading = ref(false)
const showVerificationInput = ref(false)
const countdown = ref(0)

const canRequestCode = computed(() => {
  return email.value && !verifyLoading.value && countdown.value === 0
})

const canVerifyCode = computed(() => {
  return email.value && verificationCode.value && !verifyLoading.value
})

const canRegister = computed(() => {
  return authStore.emailVerified && email.value && password.value && confirmPassword.value && displayName.value
})

const requestVerificationCode = async () => {
  if (!email.value) {
    dialog.error({
      title: 'Form Error',
      content: 'Please enter your email address',
      positiveText: 'OK'
    })
    return
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.value)) {
    dialog.error({
      title: 'Email Error',
      content: 'Please enter a valid email address',
      positiveText: 'OK'
    })
    return
  }
  
  verifyLoading.value = true
  try {
    const success = await authStore.requestEmailVerification(email.value)
    if (success) {
      message.success('Verification code sent to your email')
      showVerificationInput.value = true
      countdown.value = Date.now() + 60 * 1000
    } else if (authStore.error) {
      dialog.error({
        title: 'Verification Failed',
        content: authStore.error,
        positiveText: 'OK'
      })
    }
  } catch (error: any) {
    handleApiError(error, 'Verification Failed')
  } finally {
    verifyLoading.value = false
  }
}

const verifyCode = async () => {
  if (!email.value || !verificationCode.value) {
    dialog.error({
      title: 'Form Error',
      content: 'Please enter both email and verification code',
      positiveText: 'OK'
    })
    return
  }
  
  verifyLoading.value = true
  try {
    const success = await authStore.verifyEmailCode(email.value, verificationCode.value)
    
    if (success) {
      message.success('Email verified successfully')
    } else if (authStore.error) {
      dialog.error({
        title: 'Verification Failed',
        content: authStore.error,
        positiveText: 'OK'
      })
    }
  } catch (error: any) {
    handleApiError(error, 'Verification Failed')
  } finally {
    verifyLoading.value = false
  }
}

const handleRegister = async () => {
  if (!authStore.emailVerified) {
    dialog.error({
      title: 'Verification Required',
      content: 'Please verify your email address before registering',
      positiveText: 'OK'
    })
    return
  }
  
  if (!email.value || !password.value || !confirmPassword.value || !displayName.value || !verificationCode.value) {
    dialog.error({
      title: 'Form Error',
      content: 'Please fill in all fields',
      positiveText: 'OK'
    })
    return
  }
  
  if (password.value !== confirmPassword.value) {
    dialog.error({
      title: 'Password Error',
      content: 'Passwords do not match',
      positiveText: 'OK'
    })
    return
  }
  
  if (password.value.length < 6) {
    dialog.error({
      title: 'Password Error',
      content: 'Password must be at least 6 characters',
      positiveText: 'OK'
    })
    return
  }
  
  loading.value = true
  try {
    const success = await authStore.register(email.value, password.value, displayName.value, verificationCode.value)
    
    if (success) {
      message.success('Registration successful')
      router.push('/login')
    } else if (authStore.error) {
      dialog.error({
        title: 'Registration Failed',
        content: authStore.error,
        positiveText: 'OK'
      })
    }
  } catch (error: any) {
    handleApiError(error, 'Registration Failed')
  } finally {
    loading.value = false
  }
}

const goToLogin = () => {
  router.push('/login')
}

// Handle countdown finish
const handleCountdownFinish = () => {
  countdown.value = 0
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
          <n-input-group>
            <n-input 
              v-model:value="email" 
              placeholder="Enter your email" 
              :disabled="authStore.emailVerified"
            />
            <n-button 
              type="primary" 
              ghost 
              :disabled="!canRequestCode || authStore.emailVerified" 
              :loading="verifyLoading"
              @click="requestVerificationCode"
            >
              <span v-if="countdown === 0">Send Code</span>
              <n-countdown 
                v-else 
                :duration="countdown - Date.now()" 
                :active="countdown > Date.now()" 
                :precision="1"
                @finish="handleCountdownFinish"
              />
            </n-button>
          </n-input-group>
        </n-form-item>
        
        <n-form-item v-if="showVerificationInput" label="Verification Code" required>
          <n-input-group>
            <n-input 
              v-model:value="verificationCode" 
              placeholder="Enter verification code" 
              :disabled="authStore.emailVerified"
            />
            <n-button 
              type="primary" 
              ghost 
              :disabled="!canVerifyCode || authStore.emailVerified" 
              :loading="verifyLoading"
              @click="verifyCode"
            >
              Verify
            </n-button>
          </n-input-group>
          <div class="verification-status">
            <span v-if="authStore.emailVerified" class="verified">
              ✓ Email verified
            </span>
          </div>
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
            :disabled="!canRegister"
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

.verification-status {
  margin-top: 5px;
  font-size: 0.9em;
}

.verified {
  color: #18a058;
  font-weight: 500;
}
</style>
