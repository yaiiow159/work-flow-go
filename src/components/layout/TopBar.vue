<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { useNotificationsStore } from '../../stores/notifications'
import { useThemeStore } from '../../stores/theme'
import NotificationItem from '../notifications/NotificationItem.vue'

const emit = defineEmits(['toggle-sidebar'])
const router = useRouter()
const authStore = useAuthStore()
const notificationsStore = useNotificationsStore()
const themeStore = useThemeStore()
const userDisplayName = computed(() => authStore.userDisplayName)

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

const closeMenus = (event: MouseEvent) => {
  const notificationMenu = document.getElementById('notification-menu')
  const userMenu = document.getElementById('user-menu')
  const notificationButton = document.getElementById('notification-button')
  const userMenuButton = document.getElementById('user-menu-button')
  
  if (notificationMenu && !notificationMenu.contains(event.target as Node) && 
      notificationButton && !notificationButton.contains(event.target as Node)) {
    showNotifications.value = false
  }
  
  if (userMenu && !userMenu.contains(event.target as Node) && 
      userMenuButton && !userMenuButton.contains(event.target as Node)) {
    showUserMenu.value = false
  }
}

const toggleNotifications = (event: MouseEvent) => {
  event.stopPropagation()
  showNotifications.value = !showNotifications.value
  
  if (showNotifications.value) {
    showUserMenu.value = false
    notificationsStore.fetchNotifications().catch(e => {
      console.error('fetchNotifications error', e)
    })
  }
}

const toggleUserMenu = (event: MouseEvent) => {
  event.stopPropagation()
  showUserMenu.value = !showUserMenu.value
  
  if (showUserMenu.value) {
    showNotifications.value = false
  }
}

const handleMarkAsRead = (id: string) => {
  notificationsStore.markAsRead(id)
}

const handleMarkAllAsRead = () => {
  notificationsStore.markAllAsRead()
}

const handleDeleteNotification = (id: string) => {
  notificationsStore.deleteNotification(id)
}

const handleLogout = () => {
  authStore.logout()
}

const goToSettings = () => {
  router.push('/settings')
}

const goToProfile = () => {
  router.push('/profile')
}

const userPhotoURL = computed(() => authStore.user?.photoURL)

const userInitials = computed(() => {
  const name = userDisplayName.value
  if (!name) return 'U'
  
  const parts = name.split(' ')
  if (parts.length > 1) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
})

const primaryColor = computed(() => themeStore.primaryColor)

const adjustColor = (hex: string, percent: number): string => {
  hex = hex.replace(/^#/, '')
  
  const bigint = parseInt(hex, 16)
  let r = (bigint >> 16) & 255
  let g = (bigint >> 8) & 255
  let b = bigint & 255
  
  r = Math.min(255, Math.max(0, r + percent))
  g = Math.min(255, Math.max(0, g + percent))
  b = Math.min(255, Math.max(0, b + percent))
  
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
}

const primaryColorHover = computed(() => adjustColor(primaryColor.value, 10))

onMounted(() => {
  document.addEventListener('click', closeMenus)
  notificationsStore.fetchNotifications().catch(e => {
    console.error('Failed to fetch notifications:', e)
  })
})

onUnmounted(() => {
  document.removeEventListener('click', closeMenus)
})
</script>

<template>
  <header class="bg-[#18181c] border-b border-[#2d2d35] px-4 py-3">
    <div class="flex justify-between items-center">
      <div class="flex items-center">
        <button
          @click="toggleSidebar"
          class="p-2 rounded-md text-gray-400 hover:bg-[#2d2d35] hover:text-white transition-colors duration-200"
        >
          <i class="pi pi-bars" style="font-size: 1.1rem;"></i>
        </button>

        <div class="ml-4 hidden md:block">
          <h2 class="text-lg font-medium text-white">{{ currentDate }}</h2>
        </div>
      </div>

      <div class="flex items-center space-x-4">
        <router-link
          to="/interviews/new"
          :class="`btn btn-primary hidden sm:flex items-center px-3 py-1.5 rounded-md bg-[${primaryColor}] hover:bg-[${primaryColorHover}] text-white transition-colors duration-200`"
        >
          <i class="pi pi-plus mr-2" style="font-size: 0.9rem;"></i>
          <span>New Interview</span>
        </router-link>

        <button
          @click="themeStore.toggleDarkMode"
          class="p-2 rounded-full text-gray-400 hover:bg-[#2d2d35] hover:text-white transition-colors duration-200"
          aria-label="Toggle dark mode"
        >
          <i v-if="themeStore.isDarkMode" class="pi pi-sun" style="font-size: 1.1rem;"></i>
          <i v-else class="pi pi-moon" style="font-size: 1.1rem;"></i>
        </button>

        <div class="relative">
          <button
            id="notification-button"
            @click="toggleNotifications($event)"
            class="p-2 rounded-full text-gray-400 hover:bg-[#2d2d35] hover:text-white transition-colors duration-200 relative"
            aria-label="Toggle notifications"
          >
            <i class="pi pi-bell" style="font-size: 1.1rem;"></i>
            <span
              v-if="notificationsStore.unreadCount > 0"
              class="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"
            ></span>
          </button>

          <div
            id="notification-menu"
            v-show="showNotifications"
            class="absolute right-0 mt-2 w-80 bg-[#18181c] rounded-md shadow-lg z-10 overflow-hidden border border-[#2d2d35]"
          >
            <div class="p-3 border-b border-[#2d2d35] flex justify-between items-center">
              <h3 class="font-medium text-white">Notifications</h3>
              <span v-if="notificationsStore.unreadCount > 0" :class="`text-xs bg-[${primaryColor}] text-white px-2 py-0.5 rounded-full`">
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
              <div v-else class="p-4 text-center text-gray-400">
                No notifications
              </div>
            </div>

            <div v-if="notificationsStore.notifications.length > 0" class="p-2 border-t border-[#2d2d35] text-center">
              <button
                @click="handleMarkAllAsRead"
                :class="`text-sm text-[${primaryColor}] hover:text-[${primaryColorHover}]`"
              >
                Mark all as read
              </button>
            </div>
          </div>
        </div>
        
        <div class="relative">
          <button 
            id="user-menu-button"
            @click="toggleUserMenu($event)" 
            class="flex items-center space-x-2"
          >
            <div v-if="userPhotoURL" class="w-8 h-8 rounded-full overflow-hidden border border-[#2d2d35]">
              <img :src="userPhotoURL" alt="User" class="w-full h-full object-cover" />
            </div>
            <div v-else class="w-8 h-8 rounded-full bg-[#4a69bd] flex items-center justify-center text-white border border-[#2d2d35]">
              <span class="text-sm font-medium">{{ userInitials }}</span>
            </div>
          </button>
          
          <div
            id="user-menu"
            v-show="showUserMenu" 
            class="absolute right-0 mt-2 w-48 bg-[#18181c] rounded-md shadow-lg z-10 border border-[#2d2d35]"
          >
            <div class="p-3 border-b border-[#2d2d35]">
              <h3 class="font-medium text-white">{{ userDisplayName }}</h3>
              <p class="text-xs text-gray-400">
                {{ authStore.user?.email }}
              </p>
            </div>
            
            <div class="py-1">
              <button 
                @click="goToProfile"
                class="w-full text-left px-4 py-2 hover:bg-[#2d2d35] text-gray-300"
              >
                <i class="pi pi-user mr-2" style="font-size: 0.9rem;"></i>
                Profile
              </button>
              
              <button 
                @click="goToSettings"
                class="w-full text-left px-4 py-2 hover:bg-[#2d2d35] text-gray-300"
              >
                <i class="pi pi-cog mr-2" style="font-size: 0.9rem;"></i>
                Settings
              </button>
              
              <button 
                @click="handleLogout"
                class="w-full text-left px-4 py-2 hover:bg-[#2d2d35] text-red-400"
              >
                <i class="pi pi-sign-out mr-2" style="font-size: 0.9rem;"></i>
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>
