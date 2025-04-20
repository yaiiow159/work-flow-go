<template>
  <div class="change-password-form">
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div class="form-group">
        <label for="currentPassword" class="block text-sm font-medium text-blue-300 mb-1">Current Password</label>
        <div class="relative">
          <i class="pi pi-lock absolute left-3 top-3 text-blue-400"></i>
          <input
            id="currentPassword"
            v-model="passwordForm.currentPassword"
            type="password"
            class="form-input w-full pl-10 bg-[#1e1e24] border border-[#2d2d35] text-white focus:border-[#4a69bd] focus:ring-2 focus:ring-[#4a69bd]/50 rounded-md shadow-md"
            placeholder="Enter your current password"
            autocomplete="current-password"
          />
        </div>
        <div v-if="errors.currentPassword" class="text-red-400 text-sm mt-1">{{ errors.currentPassword }}</div>
      </div>
      
      <div class="form-group">
        <label for="newPassword" class="block text-sm font-medium text-blue-300 mb-1">New Password</label>
        <div class="relative">
          <i class="pi pi-key absolute left-3 top-3 text-blue-400"></i>
          <input
            id="newPassword"
            v-model="passwordForm.newPassword"
            type="password"
            class="form-input w-full pl-10 bg-[#1e1e24] border border-[#2d2d35] text-white focus:border-[#4a69bd] focus:ring-2 focus:ring-[#4a69bd]/50 rounded-md shadow-md"
            placeholder="Enter your new password"
            autocomplete="new-password"
          />
        </div>
        <div v-if="errors.newPassword" class="text-red-400 text-sm mt-1">{{ errors.newPassword }}</div>
      </div>
      
      <div class="form-group">
        <label for="confirmPassword" class="block text-sm font-medium text-blue-300 mb-1">Confirm Password</label>
        <div class="relative">
          <i class="pi pi-check-circle absolute left-3 top-3 text-blue-400"></i>
          <input
            id="confirmPassword"
            v-model="passwordForm.confirmPassword"
            type="password"
            class="form-input w-full pl-10 bg-[#1e1e24] border border-[#2d2d35] text-white focus:border-[#4a69bd] focus:ring-2 focus:ring-[#4a69bd]/50 rounded-md shadow-md"
            placeholder="Confirm your new password"
            autocomplete="new-password"
          />
        </div>
        <div v-if="errors.confirmPassword" class="text-red-400 text-sm mt-1">{{ errors.confirmPassword }}</div>
      </div>
      
      <div class="flex justify-end mt-6">
        <button
          type="submit"
          class="btn bg-gradient-to-r from-[#1e3799] to-[#4a69bd] hover:from-[#0c2461] hover:to-[#1e3799] text-white font-medium py-2 px-6 rounded-md shadow-lg hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#4a69bd]/50 hover:scale-105"
          :disabled="isSubmitting"
        >
          <i v-if="isSubmitting" class="pi pi-spin pi-spinner mr-2"></i>
          <i v-else class="pi pi-lock mr-2"></i>
          <span>Change Password</span>
        </button>
      </div>
    </form>
    
    <div v-if="showSuccessModal" class="mt-4 p-4 bg-[#0c2461]/50 border border-[#4a69bd] rounded-md text-center animate-fade-in">
      <i class="pi pi-check-circle text-green-400 text-2xl mb-2"></i>
      <p class="text-white">Your password has been successfully changed.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useMessage } from 'naive-ui'
import { userApi } from '../../services/api'
import type { PasswordChangeRequest } from '../../types'

const isSubmitting = ref(false)
const showSuccessModal = ref(false)
const message = useMessage()

const passwordForm = ref<PasswordChangeRequest>({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const errors = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const validateForm = () => {
  errors.value = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  }
  
  let isValid = true
  
  if (!passwordForm.value.currentPassword) {
    errors.value.currentPassword = 'Current password is required'
    isValid = false
  }
  
  if (!passwordForm.value.newPassword) {
    errors.value.newPassword = 'New password is required'
    isValid = false
  } else if (passwordForm.value.newPassword.length < 6) {
    errors.value.newPassword = 'New password must be at least 6 characters'
    isValid = false
  }
  
  if (!passwordForm.value.confirmPassword) {
    errors.value.confirmPassword = 'Please confirm your new password'
    isValid = false
  } else if (passwordForm.value.confirmPassword !== passwordForm.value.newPassword) {
    errors.value.confirmPassword = 'Passwords do not match'
    isValid = false
  }
  
  return isValid
}

const handleSubmit = async (e: Event) => {
  e.preventDefault()
  
  if (!validateForm()) {
    message.warning('Please fix the form errors before submitting')
    return
  }
  
  isSubmitting.value = true
  try {
    await userApi.changePassword(passwordForm.value)
    
    message.success('Password changed successfully')
    showSuccessModal.value = true
    resetForm()
  } catch (error: any) {
    console.error('Password Change Failed:', error)
    
    if (error.response && error.response.data && error.response.data.message) {
      message.error(error.response.data.message)
    } else if (error.message) {
      message.error(error.message)
    } else {
      message.error('Failed to change password. Please try again.')
    }
  } finally {
    isSubmitting.value = false
  }
}

const resetForm = () => {
  passwordForm.value = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  }
  errors.value = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  }
}

</script>

<style scoped>
.change-password-form {
  max-width: 100%;
}

.animate-fade-in {
  animation: fadeIn 0.5s ease-in-out forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
