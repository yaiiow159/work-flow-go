<template>
  <div class="container mx-auto py-8 px-4">
    <div class="max-w-4xl mx-auto">
      <div class="flex justify-between items-center mb-8">
        <button 
          @click="goBack" 
          class="text-green-300 hover:text-green-200 flex items-center group transition-all duration-300 hover:scale-105"
        >
          <i class="pi pi-arrow-left mr-2 transition-transform duration-300 group-hover:-translate-x-1"></i>
          Back
        </button>
        <h1 class="text-3xl font-bold text-center text-white animate-fade-in">Profile</h1>
        <div class="w-16"></div>
      </div>
      
      <div class="bg-gray-900 rounded-lg shadow-xl overflow-hidden mb-8 animate-slide-up">
        <div class="bg-gradient-to-r from-green-900/80 to-teal-900/80 p-8">
          <div class="flex flex-col md:flex-row items-center">
            <div class="relative mb-6 md:mb-0 md:mr-8 animate-fade-in">
              <div v-if="profileImagePreview || userPhotoURL" class="w-32 h-32 rounded-full overflow-hidden border-4 border-green-400 shadow-lg hover:scale-105 transition-transform duration-300">
                <img 
                  :src="profileImagePreview || userPhotoURL" 
                  alt="Profile" 
                  class="w-full h-full object-cover"
                />
              </div>
              <div 
                v-else 
                class="w-32 h-32 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center text-white border-4 border-green-400 shadow-lg hover:scale-105 transition-transform duration-300"
              >
                <span class="text-3xl font-medium">{{ userInitials }}</span>
              </div>
              
              <label class="absolute bottom-0 right-0 bg-green-600 rounded-full p-2 shadow-lg cursor-pointer hover:bg-green-500 transition-all duration-300 hover:scale-110">
                <input 
                  type="file" 
                  accept="image/*" 
                  class="hidden" 
                  @change="handleImageChange"
                />
                <i class="pi pi-camera text-white"></i>
              </label>
            </div>
            
            <div class="text-center md:text-left flex-1 animate-fade-in">
              <h2 class="text-2xl font-bold mb-1 text-white">{{ profileForm.name || authStore.userDisplayName }}</h2>
              <p class="text-green-200 mb-4">{{ profileForm.email || authStore.user?.email }}</p>
              <div class="flex flex-wrap justify-center md:justify-start gap-3 mt-3">
                <div v-if="profileForm.position" class="inline-flex items-center px-3 py-1 bg-green-900/50 text-green-200 rounded-full text-sm shadow-md border border-green-700/50 hover:bg-green-800/50 transition-colors duration-300">
                  <i class="pi pi-briefcase mr-1 text-green-300"></i>
                  {{ profileForm.position }}
                </div>
                <div v-if="profileForm.company" class="inline-flex items-center px-3 py-1 bg-teal-900/50 text-teal-200 rounded-full text-sm shadow-md border border-teal-700/50 hover:bg-teal-800/50 transition-colors duration-300">
                  <i class="pi pi-building mr-1 text-teal-300"></i>
                  {{ profileForm.company }}
                </div>
                <div v-if="profileForm.location" class="inline-flex items-center px-3 py-1 bg-emerald-900/50 text-emerald-200 rounded-full text-sm shadow-md border border-emerald-700/50 hover:bg-emerald-800/50 transition-colors duration-300">
                  <i class="pi pi-map-marker mr-1 text-emerald-300"></i>
                  {{ profileForm.location }}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="p-8 bg-gray-900">
          <form @submit.prevent="saveProfile">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="form-group animate-fade-in" style="animation-delay: 100ms;">
                <label for="name" class="form-label font-medium text-green-200">Full Name</label>
                <div class="relative">
                  <i class="pi pi-user absolute left-3 top-3 text-green-400"></i>
                  <input 
                    id="name"
                    v-model="profileForm.name"
                    type="text" 
                    class="form-input pl-10 bg-gray-800 border-gray-700 text-white focus:border-green-500 focus:ring focus:ring-green-500/30 rounded-md shadow-md"
                    placeholder="Your full name"
                  />
                </div>
              </div>
              
              <div class="form-group animate-fade-in" style="animation-delay: 150ms;">
                <label for="email" class="form-label font-medium text-green-200">Email</label>
                <div class="relative">
                  <i class="pi pi-envelope absolute left-3 top-3 text-green-400"></i>
                  <input 
                    id="email"
                    v-model="profileForm.email"
                    type="email" 
                    class="form-input pl-10 bg-gray-800 border-gray-700 text-white focus:border-green-500 focus:ring focus:ring-green-500/30 rounded-md shadow-md opacity-80"
                    placeholder="Your email"
                    disabled
                  />
                </div>
                <small class="text-gray-400 mt-1 inline-block">Email cannot be changed</small>
              </div>
              
              <div class="form-group animate-fade-in" style="animation-delay: 200ms;">
                <label for="phone" class="form-label font-medium text-green-200">Phone</label>
                <div class="relative">
                  <i class="pi pi-phone absolute left-3 top-3 text-green-400"></i>
                  <input 
                    id="phone"
                    v-model="profileForm.phone"
                    type="tel" 
                    class="form-input pl-10 bg-gray-800 border-gray-700 text-white focus:border-green-500 focus:ring focus:ring-green-500/30 rounded-md shadow-md"
                    placeholder="Your phone number"
                  />
                </div>
              </div>
              
              <div class="form-group animate-fade-in" style="animation-delay: 250ms;">
                <label for="location" class="form-label font-medium text-green-200">Location</label>
                <div class="relative">
                  <i class="pi pi-map-marker absolute left-3 top-3 text-green-400"></i>
                  <input 
                    id="location"
                    v-model="profileForm.location"
                    type="text" 
                    class="form-input pl-10 bg-gray-800 border-gray-700 text-white focus:border-green-500 focus:ring focus:ring-green-500/30 rounded-md shadow-md"
                    placeholder="Your location"
                  />
                </div>
              </div>
              
              <div class="form-group animate-fade-in" style="animation-delay: 300ms;">
                <label for="company" class="form-label font-medium text-green-200">Company</label>
                <div class="relative">
                  <i class="pi pi-building absolute left-3 top-3 text-green-400"></i>
                  <input 
                    id="company"
                    v-model="profileForm.company"
                    type="text" 
                    class="form-input pl-10 bg-gray-800 border-gray-700 text-white focus:border-green-500 focus:ring focus:ring-green-500/30 rounded-md shadow-md"
                    placeholder="Your company"
                  />
                </div>
              </div>
              
              <div class="form-group animate-fade-in" style="animation-delay: 350ms;">
                <label for="position" class="form-label font-medium text-green-200">Position</label>
                <div class="relative">
                  <i class="pi pi-briefcase absolute left-3 top-3 text-green-400"></i>
                  <input 
                    id="position"
                    v-model="profileForm.position"
                    type="text" 
                    class="form-input pl-10 bg-gray-800 border-gray-700 text-white focus:border-green-500 focus:ring focus:ring-green-500/30 rounded-md shadow-md"
                    placeholder="Your position"
                  />
                </div>
              </div>
              
              <div class="form-group md:col-span-2 animate-fade-in" style="animation-delay: 400ms;">
                <label for="bio" class="form-label font-medium text-green-200">Bio</label>
                <div class="relative">
                  <i class="pi pi-user-edit absolute left-3 top-3 text-green-400"></i>
                  <textarea 
                    id="bio"
                    v-model="profileForm.bio"
                    class="form-textarea pl-10 bg-gray-800 border-gray-700 text-white focus:border-green-500 focus:ring focus:ring-green-500/30 rounded-md shadow-md"
                    rows="4"
                    placeholder="Tell us about yourself"
                  ></textarea>
                </div>
              </div>
            </div>
            
            <div class="mt-8 flex flex-col sm:flex-row items-center justify-between animate-fade-in" style="animation-delay: 450ms;">
              <button 
                type="submit" 
                class="btn bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-medium py-2 px-6 rounded-md shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto mb-4 sm:mb-0 focus:outline-none focus:ring-2 focus:ring-green-500/50 hover:scale-105"
                :disabled="isLoading"
              >
                <i v-if="isLoading" class="pi pi-spin pi-spinner mr-2"></i>
                <i v-else class="pi pi-save mr-2"></i>
                <span>Save Profile</span>
              </button>
              
              <div>
                <span v-if="saveSuccess" class="text-green-400 flex items-center animate-pulse">
                  <i class="pi pi-check-circle mr-1"></i> Profile updated successfully
                </span>
                
                <span v-if="saveError" class="text-red-400 flex items-center">
                  <i class="pi pi-times-circle mr-1"></i> {{ saveError }}
                </span>
              </div>
            </div>
          </form>
        </div>
      </div>
      
      <div class="bg-gray-900 rounded-lg shadow-xl overflow-hidden animate-slide-up" style="animation-delay: 200ms;">
        <div class="p-6 border-b border-gray-700 bg-gradient-to-r from-green-900/80 to-teal-900/80">
          <h2 class="text-xl font-bold flex items-center text-white">
            <i class="pi pi-shield mr-2 text-green-400"></i>
            Account Security
          </h2>
        </div>
        
        <div class="p-6">
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center py-3">
            <div>
              <h3 class="font-medium text-lg text-white">Password</h3>
              <p class="text-sm text-gray-400">Change your account password</p>
            </div>
            <button 
              @click="togglePasswordForm" 
              class="btn mt-3 sm:mt-0 border border-green-500 text-green-300 hover:bg-green-800/50 font-medium py-2 px-4 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all duration-300 hover:scale-105"
            >
              <i class="pi pi-lock mr-2"></i>
              {{ showPasswordForm ? 'Cancel' : 'Change Password' }}
            </button>
          </div>
          
          <div v-if="showPasswordForm" class="mt-6 p-6 border border-gray-700 rounded-lg bg-gray-800/50 animate-fade-in">
            <ChangePasswordForm />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.6s ease-in-out forwards;
  opacity: 0;
}

.animate-slide-up {
  animation: slideUp 0.6s ease-out forwards;
  opacity: 0;
  transform: translateY(20px);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { userSettingsApi, userApi } from '../services/api'
import type { UserSettingsRequest } from '../types'
import ChangePasswordForm from '../components/user/ChangePasswordForm.vue'
import { useMessage } from 'naive-ui'
import { handleApiError } from '../utils/errorHandler'
import { useRouter } from 'vue-router'

const router = useRouter()
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

const goBack = () => {
  router.back()
}

onMounted(() => {
  fetchUserProfile()
})
</script>
