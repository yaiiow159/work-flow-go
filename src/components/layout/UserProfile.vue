<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { 
  NDropdown, 
  NAvatar, 
  NButton, 
  NSpace, 
  NText,
  useMessage
} from 'naive-ui'
import { useAuthStore } from '../../stores/auth'

const router = useRouter()
const message = useMessage()
const authStore = useAuthStore()

const user = computed(() => authStore.user)
const userDisplayName = computed(() => authStore.userDisplayName)
const isAuthenticated = computed(() => authStore.isAuthenticated)

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
