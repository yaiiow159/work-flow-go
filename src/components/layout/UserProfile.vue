<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { 
  NDropdown, 
  NAvatar, 
  NButton, 
  NSpace, 
  NText,
  NModal,
  NUpload,
  NUploadDragger,
  NIcon,
  useMessage
} from 'naive-ui'
import { useAuthStore } from '../../stores/auth'
import { CloudUploadOutline } from '@vicons/ionicons5'
import type { UploadFileInfo } from 'naive-ui'

const router = useRouter()
const message = useMessage()
const authStore = useAuthStore()

const user = computed(() => authStore.user)
const userDisplayName = computed(() => authStore.userDisplayName)
const isAuthenticated = computed(() => authStore.isAuthenticated)
const isUploading = ref(false)
const showUploadModal = ref(false)
const fileList = ref<UploadFileInfo[]>([])

const options = computed(() => [
  {
    key: 'profile',
    label: 'Profile'
  },
  {
    key: 'settings',
    label: 'Settings'
  },
  {
    key: 'upload-photo',
    label: 'Upload Profile Photo'
  },
  {
    type: 'divider',
    key: 'd1'
  },
  {
    key: 'logout',
    label: 'Logout'
  }
])

const handleSelect = (key: string) => {
  if (key === 'logout') {
    handleLogout()
  } else if (key === 'settings') {
    router.push('/settings')
  } else if (key === 'profile') {
    router.push('/profile')
  } else if (key === 'upload-photo') {
    showUploadModal.value = true
  }
}

const handleLogout = async () => {
  await authStore.logout()
  message.success('Logged out successfully')
  router.push('/login')
}

const goToLogin = () => {
  router.push('/login')
}

const handleUpload = async ({ file }: { file: UploadFileInfo }) => {
  if (!file) return

  isUploading.value = true
  try {
    const success = await authStore.updateProfileImage(file.file as File)
    if (success) {
      message.success('Profile image updated successfully')
      showUploadModal.value = false
      fileList.value = []
    } else {
      message.error(authStore.error || 'Failed to update profile image')
    }
  } catch (error) {
    console.error('Upload error:', error)
    message.error('Failed to upload image')
  } finally {
    isUploading.value = false
  }
}

const closeUploadModal = () => {
  showUploadModal.value = false
  fileList.value = []
}
</script>

<template>
  <div class="user-profile">
    <template v-if="isAuthenticated">
      <n-dropdown :options="options" @select="handleSelect">
        <n-space align="center">
          <n-avatar 
            v-if="user?.photoURL" 
            :src="user.photoURL" 
            round 
            size="small"
          />
          <n-avatar 
            v-else 
            round 
            size="small"
          >
            {{ userDisplayName.charAt(0).toUpperCase() }}
          </n-avatar>
          <n-text>{{ userDisplayName }}</n-text>
        </n-space>
      </n-dropdown>
      
      <n-modal
        v-model:show="showUploadModal"
        preset="card"
        title="Upload Profile Image"
        style="width: 450px"
        :mask-closable="false"
      >
        <n-space vertical>
          <n-upload
            v-model:file-list="fileList"
            :max="1"
            :custom-request="handleUpload"
            accept="image/*"
          >
            <n-upload-dragger>
              <div style="padding: 20px">
                <n-icon size="48" :depth="3">
                  <cloud-upload-outline />
                </n-icon>
                <div style="margin-top: 12px">
                  <n-text style="font-size: 16px">
                    Click or drag a file to this area to upload
                  </n-text>
                </div>
                <n-text depth="3" style="font-size: 14px; margin-top: 8px">
                  Only image files are supported
                </n-text>
              </div>
            </n-upload-dragger>
          </n-upload>
          
          <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 12px">
            <n-button @click="closeUploadModal">
              Cancel
            </n-button>
            <n-button 
              type="primary" 
              :loading="isUploading"
              :disabled="fileList.length === 0"
              @click="handleUpload({ file: fileList[0] })"
            >
              Upload
            </n-button>
          </div>
        </n-space>
      </n-modal>
    </template>
    <template v-else>
      <n-button size="small" @click="goToLogin">
        Login
      </n-button>
    </template>
  </div>
</template>

<style scoped>
.user-profile {
  padding: 8px 16px;
  cursor: pointer;
}
</style>
