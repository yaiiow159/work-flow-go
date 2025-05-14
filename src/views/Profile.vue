<template>
  <div class="profile-container">
    <div class="header-section">
      <n-button @click="goBack" text>
        <i class="pi pi-arrow-left mr-2"></i> Back
      </n-button>
      <h1 class="page-title">Profile</h1>
    </div>

    <n-card class="profile-card">
      <div class="profile-header">
        <div class="profile-image-container">
          <div v-if="profileImagePreview" class="profile-image">
            <img :src="profileImagePreview" alt="Profile" class="profile-img" />
          </div>
          <div v-else-if="userPhotoURL" class="profile-image">
            <img :src="userPhotoURL" alt="Profile" class="profile-img" />
          </div>
          <div v-else class="profile-initials">
            {{ userInitials }}
          </div>
          <label class="camera-button">
            <input type="file" accept="image/*" @change="handleImageChange" class="hidden" />
            <i class="pi pi-camera"></i>
          </label>
        </div>
        <div class="profile-info">
          <h2 class="profile-name">{{ profileForm.name || authStore.userDisplayName }}</h2>
          <p class="profile-email">{{ profileForm.email || authStore.user?.email }}</p>
        </div>
      </div>

      <div class="profile-form">
        <n-form>
          <div class="form-grid">
            <div class="form-group">
              <n-form-item label="Full Name">
                <n-input v-model:value="profileForm.name" placeholder="Your full name" />
              </n-form-item>
            </div>
            
            <div class="form-group">
              <n-form-item label="Email">
                <n-input v-model:value="profileForm.email" placeholder="Your email" disabled />
                <template #help>
                  <small class="form-help">Email cannot be changed</small>
                </template>
              </n-form-item>
            </div>
            
            <div class="form-group">
              <n-form-item label="Phone">
                <n-input v-model:value="profileForm.phone" placeholder="Your phone number" />
              </n-form-item>
            </div>
            
            <div class="form-group">
              <n-form-item label="Location">
                <n-input v-model:value="profileForm.location" placeholder="Your location" />
              </n-form-item>
            </div>
            
            <div class="form-group">
              <n-form-item label="Company">
                <n-input v-model:value="profileForm.company" placeholder="Your company" />
              </n-form-item>
            </div>
            
            <div class="form-group">
              <n-form-item label="Position">
                <n-input v-model:value="profileForm.position" placeholder="Your position" />
              </n-form-item>
            </div>
            
            <div class="form-group full-width">
              <n-form-item label="Bio">
                <n-input 
                  v-model:value="profileForm.bio" 
                  type="textarea" 
                  placeholder="Tell us about yourself"
                  :autosize="{ minRows: 3, maxRows: 5 }"
                />
              </n-form-item>
            </div>
          </div>
          
          <div class="form-actions">
            <n-button 
              type="primary" 
              @click="saveProfile" 
              :loading="isLoading"
            >
              <template #icon>
                <i class="pi pi-save"></i>
              </template>
              Save Profile
            </n-button>
            <span v-if="saveSuccess" class="success-message">
              <i class="pi pi-check-circle mr-1"></i> Profile updated successfully
            </span>
          </div>
        </n-form>
      </div>
    </n-card>

    <n-card class="password-card">
      <div class="password-header">
        <i class="pi pi-shield mr-2"></i> Password
      </div>
      <div class="password-content">
        <p class="password-description">Update your password to keep your account secure</p>
        <n-button 
          type="primary" 
          @click="togglePasswordForm"
        >
          <template #icon>
            <i class="pi pi-lock"></i>
          </template>
          {{ showPasswordForm ? 'Cancel' : 'Change Password' }}
        </n-button>
      </div>
      <div v-if="showPasswordForm" class="password-form-container">
        <ChangePasswordForm @success="showPasswordForm = false" />
      </div>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { userSettingsApi } from '../services/api'
import { 
  useMessage, 
  NButton, 
  NCard, 
  NForm, 
  NFormItem, 
  NInput 
} from 'naive-ui'
import ChangePasswordForm from '../components/user/ChangePasswordForm.vue'

const router = useRouter()
const authStore = useAuthStore()
const message = useMessage()
const isLoading = ref(false)
const saveSuccess = ref(false)
const profileImageFile = ref<File | null>(null)
const profileImagePreview = ref<string | null>(null)

interface ProfileFormData {
  id: string;
  name: string;
  email: string;
  photoURL: string;
  phone: string;
  location: string;
  company: string;
  position: string;
  bio: string;
}

const profileForm = ref<ProfileFormData>({
  id: '',
  name: '',
  email: '',
  photoURL: '',
  phone: '',
  location: '',
  company: '',
  position: '',
  bio: ''
})

const userPhotoURL = computed(() => {
  if (!authStore.user) return null
  
  if (authStore.user.photoURL) {
    return authStore.user.photoURL
  }
  
  return null
})

const userInitials = computed(() => {
  if (!profileForm.value.name && !authStore.userDisplayName) return '?'
  
  const name = profileForm.value.name || authStore.userDisplayName
  const parts = name.split(' ')
  
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  }
  
  return name.substring(0, 2).toUpperCase()
})

function handleImageChange(event: Event) {
  const input = event.target as HTMLInputElement
  if (input.files && input.files.length > 0) {
    profileImageFile.value = input.files[0]
    
    if (profileImagePreview.value) {
      URL.revokeObjectURL(profileImagePreview.value)
    }
    
    profileImagePreview.value = URL.createObjectURL(profileImageFile.value)
  }
}

async function saveProfile() {
  isLoading.value = true
  
  try {
    if (profileImageFile.value) {
      const result = await userSettingsApi.uploadProfileImage(profileImageFile.value)
      
      if (result.success) {
        if (authStore.user) {
          authStore.user.photoURL = result.photoURL || authStore.user.photoURL
          localStorage.setItem('user', JSON.stringify(authStore.user))
        }
        
        profileForm.value.photoURL = result.photoURL || profileForm.value.photoURL
        profileImagePreview.value = null
      } else {
        throw new Error(result.error || 'Failed to upload profile image')
      }
      
      profileImageFile.value = null
    }
    
    const profileRequest = {
      id: profileForm.value.id,
      name: profileForm.value.name,
      photoURL: profileForm.value.photoURL,
      phone: profileForm.value.phone,
      location: profileForm.value.location,
      company: profileForm.value.company,
      position: profileForm.value.position,
      bio: profileForm.value.bio
    }
    
    await userSettingsApi.updateUserProfile(profileRequest)
    saveSuccess.value = true
    message.success('Profile updated successfully')
    
    await authStore.initAuth()
    
    setTimeout(() => {
      saveSuccess.value = false
    }, 3000)
  } catch (error) {
    console.error('Error saving profile:', error)
    message.error('Failed to save profile')
  } finally {
    isLoading.value = false
  }
}

async function fetchUserProfile() {
  isLoading.value = true
  try {
    const userProfile = await userSettingsApi.getUserProfile()
    
    profileForm.value = {
      id: String(userProfile.id),
      name: userProfile.name || '',
      email: userProfile.email || '',
      photoURL: userProfile.photoURL || '',
      phone: userProfile.phone || '',
      location: userProfile.location || '',
      company: userProfile.company || '',
      position: userProfile.position || '',
      bio: userProfile.bio || ''
    }
  } catch (error) {
    console.error('Error fetching user profile:', error)
    message.error('Failed to load profile')
  } finally {
    isLoading.value = false
  }
}

const showPasswordForm = ref(false)

function togglePasswordForm() {
  showPasswordForm.value = !showPasswordForm.value
}

function goBack() {
  router.back()
}

onMounted(() => {
  fetchUserProfile()
})
</script>

<style scoped>
.profile-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.header-section {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  flex: 1;
  text-align: center;
  font-size: 24px;
  font-weight: bold;
  color: white;
  margin: 0;
}

.profile-card, .password-card {
  margin-bottom: 20px;
  overflow: hidden;
}

.profile-header {
  background: linear-gradient(to right, #4a69bd, #1e3799);
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

@media (min-width: 768px) {
  .profile-header {
    flex-direction: row;
  }
}

.profile-image-container {
  position: relative;
  width: 100px;
  height: 100px;
  margin-bottom: 15px;
}

@media (min-width: 768px) {
  .profile-image-container {
    margin-right: 20px;
    margin-bottom: 0;
  }
}

.profile-image, .profile-initials {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #2d2d35;
  border: 2px solid white;
}

.profile-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-initials {
  background-color: #4a69bd;
  font-size: 36px;
  font-weight: bold;
  color: white;
}

.camera-button {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: #4a69bd;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  border: 2px solid white;
}

.hidden {
  display: none;
}

.profile-info {
  flex: 1;
  color: white;
}

.profile-name {
  margin: 0 0 5px 0;
  font-size: 20px;
}

.profile-email {
  margin: 0;
  opacity: 0.8;
}

.profile-form {
  padding: 20px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}

@media (min-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr 1fr;
  }
}

.form-group {
  margin-bottom: 10px;
}

.full-width {
  grid-column: 1 / -1;
}

.form-actions {
  margin-top: 20px;
  display: flex;
  align-items: center;
}

.success-message {
  margin-left: 15px;
  color: #52c41a;
  font-size: 14px;
}

.password-header {
  background: linear-gradient(to right, #4a69bd, #1e3799);
  color: white;
  padding: 15px 20px;
  font-size: 18px;
  font-weight: bold;
  display: flex;
  align-items: center;
}

.password-content {
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.password-description {
  margin: 0;
  color: white;
  font-size: 14px;
}

.password-form-container {
  padding: 0 20px 20px;
  border-top: 1px solid #444;
  margin-top: 10px;
}
</style>
