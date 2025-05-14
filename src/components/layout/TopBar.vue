<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { useNotificationsStore } from '../../stores/notifications'
import { useThemeStore } from '../../stores/theme'
import NotificationItem from '../notifications/NotificationItem.vue'

const emit = defineEmits(['toggle-sidebar'])
const authStore = useAuthStore()
const notificationsStore = useNotificationsStore()
const themeStore = useThemeStore()
const userDisplayName = computed(() => authStore.userDisplayName)

onMounted(() => {
  themeStore.initTheme()
  document.addEventListener('click', closeMenus)
  notificationsStore.fetchNotifications().catch(e => {
    console.error('Failed to fetch notifications:', e)
  })
})

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
const userMenuRef = ref(null)

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

const toggleUserMenu = (event: Event) => {
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
  showUserMenu.value = false
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

onUnmounted(() => {
  document.removeEventListener('click', closeMenus)
})
</script>

<template>
  <header :class="[
    themeStore.isDarkMode ? 'bg-[#18181c]' : 'bg-white', 
    themeStore.isDarkMode ? 'border-[#2d2d35]' : 'border-gray-200',
    'border-b', 
    'px-4', 
    'py-3',
    'shadow-sm'
  ]">
    <div class="flex justify-between items-center">
      <div class="flex items-center">
        <button
          @click="toggleSidebar"
          :class="[
            themeStore.isDarkMode ? 'text-gray-300 bg-[#2d2d35]' : 'text-gray-700 bg-gray-100', 
            'p-2', 
            'rounded-md', 
            'transition-colors', 
            'duration-200',
            'flex',
            'items-center',
            'justify-center'
          ]"
        >
          <i class="pi pi-bars" style="font-size: 1.1rem;"></i>
        </button>
        
        <div class="ml-4">
          <h1 class="text-lg font-semibold" :class="themeStore.isDarkMode ? 'text-white' : 'text-gray-800'">WorkFlowGo</h1>
          <p class="text-sm" :class="themeStore.isDarkMode ? 'text-gray-400' : 'text-gray-600'">{{ currentDate }}</p>
        </div>
      </div>
      
      <div class="flex items-center space-x-4">
        <a
          href="/interviews/new"
          :style="{
            display: 'flex',
            alignItems: 'center',
            padding: '6px 12px',
            borderRadius: '6px',
            backgroundColor: themeStore.isDarkMode ? '#4a69bd' : primaryColor,
            color: 'white',
            fontWeight: '500',
            border: themeStore.isDarkMode ? '1px solid #5a79cd' : '1px solid transparent',
            boxShadow: themeStore.isDarkMode ? '0 2px 4px rgba(0,0,0,0.3)' : '0 1px 3px rgba(0,0,0,0.1)',
            transition: 'all 0.2s ease'
          }"
        >
          <i class="pi pi-plus mr-2" style="font-size: 0.9rem;"></i>
          <span>New Interview</span>
        </a>

        <button
          @click="themeStore.toggleDarkMode"
          :class="[
            themeStore.isDarkMode ? 'text-yellow-400 bg-[#2d2d35]' : 'text-blue-600 bg-gray-100', 
            'p-2', 
            'rounded-full', 
            'transition-colors', 
            'duration-200',
            'flex',
            'items-center',
            'justify-center'
          ]"
          aria-label="Toggle dark mode"
        >
          <i v-if="themeStore.isDarkMode" class="pi pi-sun" style="font-size: 1.1rem;"></i>
          <i v-else class="pi pi-moon" style="font-size: 1.1rem;"></i>
        </button>

        <div class="relative">
          <button
            id="notification-button"
            @click="toggleNotifications($event)"
            :class="[
              themeStore.isDarkMode ? 'text-gray-300 bg-[#2d2d35]' : 'text-gray-700 bg-gray-100', 
              'p-2', 
              'rounded-full', 
              'transition-colors', 
              'duration-200', 
              'relative',
              'flex',
              'items-center',
              'justify-center'
            ]"
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
            :class="[themeStore.isDarkMode ? 'bg-[#18181c]' : 'bg-white', themeStore.isDarkMode ? 'border border-[#2d2d35]' : 'border border-gray-200', 'absolute', 'right-0', 'mt-2', 'w-80', 'rounded-md', 'shadow-lg', 'z-10', 'overflow-hidden']"
          >
            <div :class="[themeStore.isDarkMode ? 'border-b border-[#2d2d35]' : 'border-b border-gray-200', 'p-3', 'flex', 'justify-between', 'items-center']">
              <h3 :class="[themeStore.isDarkMode ? 'text-white' : 'text-gray-800', 'font-medium']">Notifications</h3>
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
              <div v-else :class="[themeStore.isDarkMode ? 'text-gray-400' : 'text-gray-500', 'p-4 text-center']">
                No notifications
              </div>
            </div>

            <div v-if="notificationsStore.notifications.length > 0" :class="[themeStore.isDarkMode ? 'border-t border-[#2d2d35]' : 'border-t border-gray-200', 'p-2 text-center']">
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
            :class="[
              themeStore.isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-gray-900', 
              'flex', 
              'items-center', 
              'space-x-2',
              'p-1',
              'rounded-full',
              'hover:bg-opacity-10',
              themeStore.isDarkMode ? 'hover:bg-gray-400' : 'hover:bg-gray-500'
            ]"
          >
            <div v-if="userPhotoURL" :class="[themeStore.isDarkMode ? 'border-[#2d2d35]' : 'border-gray-200', 'w-8', 'h-8', 'rounded-full', 'overflow-hidden', 'border']">
              <img :src="userPhotoURL" alt="User" class="w-full h-full object-cover" />
            </div>
            <div v-else :class="[themeStore.isDarkMode ? 'border-[#2d2d35]' : 'border-gray-300', 'w-8', 'h-8', 'rounded-full', 'bg-[#4a69bd]', 'flex', 'items-center', 'justify-center', 'text-white', 'border']">
              <span class="text-sm font-medium">{{ userInitials }}</span>
            </div>
          </button>
          
          <div
            id="user-menu"
            ref="userMenuRef"
            v-show="showUserMenu" 
            :class="[
              themeStore.isDarkMode ? 'bg-[#18181c]' : 'bg-white', 
              themeStore.isDarkMode ? 'border-[#2d2d35]' : 'border-gray-200', 
              'absolute', 
              'right-0', 
              'mt-2', 
              'w-48', 
              'rounded-md', 
              'shadow-lg', 
              'z-10',
              'border'
            ]"
          >
            <div :class="[
              themeStore.isDarkMode ? 'border-[#2d2d35]' : 'border-gray-200', 
              'border-b', 
              'p-3'
            ]">
              <h3 :class="[
                themeStore.isDarkMode ? 'text-white' : 'text-gray-800', 
                'font-medium'
              ]">{{ userDisplayName }}</h3>
              <p :class="[
                themeStore.isDarkMode ? 'text-gray-400' : 'text-gray-600',
                'text-sm'
              ]">
                {{ authStore.user?.email }}
              </p>
            </div>
            
            <div class="py-1">
              <router-link 
                to="/profile"
                :class="[
                  themeStore.isDarkMode ? 'bg-[#18181c] text-gray-300 hover:bg-[#2d2d35]' : 'bg-white text-gray-700 hover:bg-gray-100', 
                  'block', 
                  'w-full', 
                  'text-left', 
                  'px-4', 
                  'py-2',
                  'flex',
                  'items-center'
                ]"
              >
                <i class="pi pi-user mr-2" style="font-size: 0.9rem;"></i>
                Profile
              </router-link>
              
              <router-link 
                to="/settings"
                :class="[
                  themeStore.isDarkMode ? 'bg-[#18181c] text-gray-300 hover:bg-[#2d2d35]' : 'bg-white text-gray-700 hover:bg-gray-100', 
                  'block', 
                  'w-full', 
                  'text-left', 
                  'px-4', 
                  'py-2',
                  'flex',
                  'items-center'
                ]"
              >
                <i class="pi pi-cog mr-2" style="font-size: 0.9rem;"></i>
                Settings
              </router-link>
              
              <button 
                @click="handleLogout"
                :class="[
                  themeStore.isDarkMode ? 'bg-[#18181c] text-red-400 hover:bg-[#2d2d35]' : 'bg-white text-red-600 hover:bg-gray-100', 
                  'w-full', 
                  'text-left', 
                  'px-4', 
                  'py-2',
                  'flex',
                  'items-center'
                ]"
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
