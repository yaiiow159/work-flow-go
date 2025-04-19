<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits(['toggle-sidebar'])

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
const notifications = ref([
  {
    id: 1,
    title: 'Interview Reminder',
    message: 'You have an interview with ABC Corp tomorrow at 10:00 AM',
    time: '1 hour ago',
    read: false
  },
  {
    id: 2,
    title: 'Document Update',
    message: 'Your resume has been updated successfully',
    time: '2 days ago',
    read: true
  }
])

const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value
}

const markAsRead = (id: number) => {
  const notification = notifications.value.find(n => n.id === id)
  if (notification) {
    notification.read = true
  }
}
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
              v-if="notifications.some(n => !n.read)" 
              class="absolute top-0 right-0 w-2 h-2 bg-error rounded-full"
            ></span>
          </button>
          
          <div
            v-if="showNotifications" 
            class="absolute right-0 mt-2 w-80 bg-surface rounded-card shadow-card z-10"
          >
            <div class="p-3 border-b border-surface-light">
              <h3 class="font-medium">Notifications</h3>
            </div>
            
            <div class="max-h-96 overflow-y-auto">
              <template v-if="notifications.length > 0">
                <div 
                  v-for="notification in notifications" 
                  :key="notification.id"
                  @click="markAsRead(notification.id)"
                  class="p-3 border-b border-surface-light hover:bg-background-lighter cursor-pointer"
                  :class="{ 'bg-background-lighter': !notification.read }"
                >
                  <div class="flex justify-between">
                    <h4 class="font-medium">{{ notification.title }}</h4>
                    <span class="text-xs text-text-muted">{{ notification.time }}</span>
                  </div>
                  <p class="text-sm text-text-secondary mt-1">{{ notification.message }}</p>
                </div>
              </template>
              <div v-else class="p-4 text-center text-text-muted">
                No notifications
              </div>
            </div>
            
            <div class="p-2 border-t border-surface-light text-center">
              <button class="text-sm text-primary hover:text-primary-hover">
                Mark all as read
              </button>
            </div>
          </div>
        </div>
        
        <div class="relative">
          <button class="flex items-center space-x-2">
            <div class="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
              <span class="text-sm font-medium">JD</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  </header>
</template>
