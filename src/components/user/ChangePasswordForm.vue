<template>
  <div class="change-password-form">
    <n-form
      ref="formRef"
      :model="passwordForm"
      :rules="rules"
      label-placement="left"
      label-width="auto"
      require-mark-placement="right-hanging"
      size="medium"
      @submit.prevent="handleSubmit"
    >
      <n-form-item path="currentPassword" label="Current Password">
        <n-input
          v-model:value="passwordForm.currentPassword"
          type="password"
          placeholder="Enter your current password"
          :input-props="{ autocomplete: 'current-password' }"
        />
      </n-form-item>
      
      <n-form-item path="newPassword" label="New Password">
        <n-input
          v-model:value="passwordForm.newPassword"
          type="password"
          placeholder="Enter your new password"
          :input-props="{ autocomplete: 'new-password' }"
        />
      </n-form-item>
      
      <n-form-item path="confirmPassword" label="Confirm Password">
        <n-input
          v-model:value="passwordForm.confirmPassword"
          type="password"
          placeholder="Confirm your new password"
          :input-props="{ autocomplete: 'new-password' }"
        />
      </n-form-item>
      
      <n-form-item>
        <n-space justify="end">
          <n-button
            type="primary"
            attr-type="submit"
            :loading="isSubmitting"
            :disabled="isSubmitting"
          >
            Change Password
          </n-button>
        </n-space>
      </n-form-item>
    </n-form>
    
    <n-modal
      v-model:show="showSuccessModal"
      preset="dialog"
      title="Success"
      positive-text="OK"
      @positive-click="closeSuccessModal"
    >
      <template #default>
        <p>Your password has been successfully changed.</p>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useDialog } from 'naive-ui'
import type { FormInst, FormRules } from 'naive-ui'
import { userApi } from '../../services/api'
import type { PasswordChangeRequest } from '../../types'
import { handleApiError } from '../../utils/errorHandler'

const formRef = ref<FormInst | null>(null)
const dialog = useDialog()
const isSubmitting = ref(false)
const showSuccessModal = ref(false)

const passwordForm = ref<PasswordChangeRequest>({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const rules: FormRules = {
  currentPassword: [
    { required: true, message: 'Current password is required', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: 'New password is required', trigger: 'blur' },
    { min: 6, message: 'New password must be at least 6 characters', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: 'Please confirm your new password', trigger: 'blur' },
    {
      validator: (_, value) => {
        return value === passwordForm.value.newPassword
      },
      message: 'Passwords do not match',
      trigger: 'blur'
    }
  ]
}

const handleSubmit = (e: Event) => {
  e.preventDefault()
  formRef.value?.validate(async (errors) => {
    if (!errors) {
      isSubmitting.value = true
      try {
        await userApi.changePassword(passwordForm.value)
        showSuccessModal.value = true
        resetForm()
      } catch (error: any) {
        handleApiError(error, 'Password Change Failed')
      } finally {
        isSubmitting.value = false
      }
    } else {
      dialog.error({
        title: 'Form Error',
        content: 'Please fix the form errors before submitting',
        positiveText: 'OK'
      })
    }
  })
}

const resetForm = () => {
  passwordForm.value = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  }
}

const closeSuccessModal = () => {
  showSuccessModal.value = false
}
</script>

<style scoped>
.change-password-form {
  max-width: 500px;
  margin: 0 auto;
}
</style>
