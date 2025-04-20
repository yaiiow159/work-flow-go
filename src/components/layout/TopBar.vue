<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { useNotificationsStore } from '../../stores/notifications'
import NotificationItem from '../notifications/NotificationItem.vue'

const emit = defineEmits(['toggle-sidebar'])
const router = useRouter()
const authStore = useAuthStore()
const notificationsStore = useNotificationsStore()

const toggleSidebar = () => {
  emit('toggle-sidebar')
}

const currentDate = new Date().toLocaleDateString('en-US', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric'
})

const showNotifications = ref(false)
const showUserMenu = ref(false)

const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value
  if (showNotifications.value) {
    showUserMenu.value = false
    notificationsStore.fetchNotifications()
  }
}

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
  if (showUserMenu.value) {
    showNotifications.value = false
  }
}

const handleMarkAsRead = async (id: string) => {
  await notificationsStore.markAsRead(id)
}

const handleMarkAllAsRead = async () => {
  await notificationsStore.markAllAsRead()
}

const handleDeleteNotification = async (id: string) => {
  await notificationsStore.deleteNotification(id)
}

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}

const goToSettings = () => {
  router.push('/settings')
}

const goToProfile = () => {
  router.push('/profile')
}

const userInitials = computed(() => {
  const name = authStore.userDisplayName
  if (!name) return 'U'
  
  const parts = name.split(' ')
  if (parts.length > 1) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
})

const userPhotoURL = computed(() => authStore.user?.photoURL)

onMounted(async () => {
  await notificationsStore.fetchNotifications()
})
</script>

<template>
  <header class="bg-surface border-b border-surface-light px-4 py-3">
    <div class="flex justify-between items-center">
      <div class="flex items-center">
        <button 
          @click="toggleSidebar" 
          class="p-2 rounded-md text-text-secondary hover:bg-background-lighter hover:text-text transition-colors duration-200"
        >
          <i class="pi pi-bars text-xl"></i>
        </button>
        
        <div class="ml-4 hidden md:block">
          <h2 class="text-lg font-medium">{{ currentDate }}</h2>
        </div>
      </div>
      
      <div class="flex items-center space-x-4">
        <router-link
          to="/interviews/new" 
          class="btn btn-primary hidden sm:flex items-center"
        >
          <i class="pi pi-plus mr-2"></i>
          <span>New Interview</span>
        </router-link>
        
        <div class="relative">
          <button 
            @click="toggleNotifications" 
            class="p-2 rounded-full text-text-secondary hover:bg-background-lighter hover:text-text transition-colors duration-200 relative"
          >
            <i class="pi pi-bell text-xl"></i>
            <span 
              v-if="notificationsStore.unreadCount > 0" 
              class="absolute top-0 right-0 w-2 h-2 bg-error rounded-full"
            ></span>
          </button>
          
          <div
            v-if="showNotifications" 
            class="absolute right-0 mt-2 w-80 bg-surface rounded-card shadow-card z-10"
          >
            <div class="p-3 border-b border-surface-light flex justify-between items-center">
              <h3 class="font-medium">Notifications</h3>
              <span v-if="notificationsStore.unreadCount > 0" class="text-xs bg-primary text-white px-2 py-0.5 rounded-full">
                {{ notificationsStore.unreadCount }}
              </span>
            </div>
            
            <div class="max-h-96 overflow-y-auto">
              <template v-if="notificationsStore.notifications.length > 0">
                <NotificationItem
                  v-for="notification in notificationsStore.notifications" 
                  :key="notification.id"
                  :notification="notification"
                  @mark-as-read="handleMarkAsRead"
                  @delete="handleDeleteNotification"
                />
              </template>
              <div v-else class="p-4 text-center text-text-muted">
                No notifications
              </div>
            </div>
            
            <div v-if="notificationsStore.notifications.length > 0" class="p-2 border-t border-surface-light text-center">
              <button 
                @click="handleMarkAllAsRead"
                class="text-sm text-primary hover:text-primary-hover"
              >
                Mark all as read
              </button>
            </div>
          </div>
        </div>
        
        <div class="relative">
          <button 
            @click="toggleUserMenu" 
            class="flex items-center space-x-2"
          >
            <div v-if="userPhotoURL" class="w-8 h-8 rounded-full overflow-hidden">
              <img :src="userPhotoURL" alt="User" class="w-full h-full object-cover" />
            </div>
            <div v-else class="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
              <span class="text-sm font-medium">{{ userInitials }}</span>
            </div>
          </button>
          
          <div
            v-if="showUserMenu" 
            class="absolute right-0 mt-2 w-48 bg-surface rounded-card shadow-card z-10"
          >
            <div class="p-3 border-b border-surface-light">
              <h3 class="font-medium">{{ authStore.userDisplayName }}</h3>
              <p class="text-xs text-text-muted">{{ authStore.user?.email }}</p>
            </div>
            
            <div class="py-1">
              <button 
                @click="goToProfile"
                class="w-full px-4 py-2 text-left text-text-secondary hover:bg-background-lighter hover:text-text transition-colors duration-200"
              >
                <i class="pi pi-user mr-2"></i>
                <span>Profile</span>
              </button>
              
              <button 
                @click="goToSettings"
                class="w-full px-4 py-2 text-left text-text-secondary hover:bg-background-lighter hover:text-text transition-colors duration-200"
              >
                <i class="pi pi-cog mr-2"></i>
                <span>Settings</span>
              </button>
              
              <button 
                @click="handleLogout"
                class="w-full px-4 py-2 text-left text-text-secondary hover:bg-background-lighter hover:text-text transition-colors duration-200"
              >
                <i class="pi pi-sign-out mr-2"></i>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>
