<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { userSettingsApi, userApi } from '../services/api'
import type { UserSettingsRequest } from '../types'
import ChangePasswordForm from '../components/user/ChangePasswordForm.vue'
import { useMessage, useDialog } from 'naive-ui'
import { handleApiError } from '../utils/errorHandler'

const authStore = useAuthStore()
const message = useMessage()
const isLoading = ref(false)
const saveSuccess = ref(false)
const saveError = ref<string | null>(null)

interface ProfileFormData {
  id?: number | string
  name: string
  email: string
  photoURL?: string
  bio?: string
  phone?: string
  location?: string
  company?: string
  position?: string
}

const profileForm = ref<ProfileFormData>({
  name: '',
  email: '',
  photoURL: '',
  bio: '',
  phone: '',
  location: '',
  company: '',
  position: ''
})

const profileImageFile = ref<File | null>(null)
const profileImagePreview = ref<string | null>(null)

const userInitials = computed(() => {
  const name = profileForm.value.name || authStore.userDisplayName
  if (!name) return 'U'
  
  const parts = name.split(' ')
  if (parts.length > 1) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
})

const userPhotoURL = computed(() => profileForm.value.photoURL || authStore.user?.photoURL)

const handleImageChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files.length > 0) {
    profileImageFile.value = input.files[0]
    profileImagePreview.value = URL.createObjectURL(input.files[0])
  }
}

const saveProfile = async () => {
  isLoading.value = true
  saveSuccess.value = false
  saveError.value = null
  
  try {
    if (profileImageFile.value) {
      await authStore.updateProfileImage(profileImageFile.value)
    }
    
    const settingsRequest: UserSettingsRequest = {
      name: profileForm.value.name,
      email: profileForm.value.email,
      preferences: {
      }
    }
    
    await userSettingsApi.update(settingsRequest)
    saveSuccess.value = true
    message.success('Profile updated successfully')
    setTimeout(() => {
      saveSuccess.value = false
    }, 3000)
  } catch (error: any) {
    handleApiError(error, 'Profile Update Failed')
    saveError.value = error.message || 'Failed to update profile'
  } finally {
    isLoading.value = false
  }
}

const fetchUserProfile = async () => {
  isLoading.value = true
  try {
    const userProfile = await userApi.getUserProfile()
    
    const userSettings = await userSettingsApi.get()
    
    profileForm.value = {
      id: userSettings.id,
      name: userSettings.name || userProfile.name || '',
      email: userSettings.email || userProfile.email || '',
      photoURL: userSettings.photoURL || userProfile.photoURL || '',
      bio: userProfile.bio || '',
      phone: userProfile.phone || '',
      location: userProfile.location || '',
      company: userProfile.company || '',
      position: userProfile.position || ''
    }
  } catch (error: any) {
    handleApiError(error, 'Failed to Load Profile')
    saveError.value = error.message || 'Failed to fetch user profile'
  } finally {
    isLoading.value = false
  }
}

const showPasswordForm = ref(false)

const togglePasswordForm = () => {
  showPasswordForm.value = !showPasswordForm.value
}

onMounted(() => {
  fetchUserProfile()
})
</script>

<template>
  <div class="container mx-auto py-8 px-4">
    <div class="max-w-3xl mx-auto">
      <h1 class="text-2xl font-bold mb-6">Profile</h1>
      
      <div class="bg-surface rounded-card shadow-card p-6">
        <div class="flex flex-col sm:flex-row items-center mb-8">
          <div class="mb-4 sm:mb-0 sm:mr-8">
            <div v-if="profileImagePreview || userPhotoURL" class="w-32 h-32 rounded-full overflow-hidden">
              <img 
                :src="profileImagePreview || userPhotoURL" 
                alt="Profile" 
                class="w-full h-full object-cover"
              />
            </div>
            <div 
              v-else 
              class="w-32 h-32 rounded-full bg-primary flex items-center justify-center text-white"
            >
              <span class="text-3xl font-medium">{{ userInitials }}</span>
            </div>
          </div>
          
          <div>
            <h2 class="text-xl font-semibold mb-2">{{ profileForm.name || authStore.userDisplayName }}</h2>
            <p class="text-text-secondary mb-4">{{ profileForm.email || authStore.user?.email }}</p>
            
            <label class="btn btn-outline">
              <input 
                type="file" 
                accept="image/*" 
                class="hidden" 
                @change="handleImageChange"
              />
              <i class="pi pi-camera mr-2"></i>
              Change Photo
            </label>
          </div>
        </div>
        
        <form @submit.prevent="saveProfile">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="form-group">
              <label for="name" class="form-label">Full Name</label>
              <input 
                id="name"
                v-model="profileForm.name"
                type="text" 
                class="form-input"
                placeholder="Your full name"
              />
            </div>
            
            <div class="form-group">
              <label for="email" class="form-label">Email</label>
              <input 
                id="email"
                v-model="profileForm.email"
                type="email" 
                class="form-input"
                placeholder="Your email"
                disabled
              />
              <small class="text-text-muted">Email cannot be changed</small>
            </div>
            
            <div class="form-group">
              <label for="phone" class="form-label">Phone</label>
              <input 
                id="phone"
                v-model="profileForm.phone"
                type="tel" 
                class="form-input"
                placeholder="Your phone number"
              />
            </div>
            
            <div class="form-group">
              <label for="location" class="form-label">Location</label>
              <input 
                id="location"
                v-model="profileForm.location"
                type="text" 
                class="form-input"
                placeholder="Your location"
              />
            </div>
            
            <div class="form-group">
              <label for="company" class="form-label">Company</label>
              <input 
                id="company"
                v-model="profileForm.company"
                type="text" 
                class="form-input"
                placeholder="Your company"
              />
            </div>
            
            <div class="form-group">
              <label for="position" class="form-label">Position</label>
              <input 
                id="position"
                v-model="profileForm.position"
                type="text" 
                class="form-input"
                placeholder="Your position"
              />
            </div>
            
            <div class="form-group md:col-span-2">
              <label for="bio" class="form-label">Bio</label>
              <textarea 
                id="bio"
                v-model="profileForm.bio"
                class="form-textarea"
                rows="4"
                placeholder="Tell us about yourself"
              ></textarea>
            </div>
          </div>
          
          <div class="mt-6 flex items-center">
            <button 
              type="submit" 
              class="btn btn-primary"
              :disabled="isLoading"
            >
              <i v-if="isLoading" class="pi pi-spin pi-spinner mr-2"></i>
              <span>Save Profile</span>
            </button>
            
            <span v-if="saveSuccess" class="ml-4 text-success flex items-center">
              <i class="pi pi-check-circle mr-1"></i> Profile updated successfully
            </span>
            
            <span v-if="saveError" class="ml-4 text-error flex items-center">
              <i class="pi pi-times-circle mr-1"></i> {{ saveError }}
            </span>
          </div>
        </form>
      </div>
      
      <div class="bg-surface rounded-card shadow-card p-6 mt-8">
        <h2 class="text-xl font-semibold mb-4">Account Security</h2>
        
        <div class="border-t border-surface-light pt-4">
          <div class="flex justify-between items-center py-3">
            <div>
              <h3 class="font-medium">Password</h3>
              <p class="text-sm text-text-secondary">Change your account password</p>
            </div>
            <button @click="togglePasswordForm" class="btn btn-outline">
              {{ showPasswordForm ? 'Cancel' : 'Change Password' }}
            </button>
          </div>
          
          <div v-if="showPasswordForm" class="mt-4">
            <ChangePasswordForm />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
