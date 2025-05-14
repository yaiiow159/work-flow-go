<script setup lang="ts">
import { computed } from 'vue'
import type { Notification } from '../../types'
import { formatDistanceToNow } from 'date-fns'
import { useThemeStore } from '../../stores/theme'

const themeStore = useThemeStore()

const props = defineProps<{
  notification: Notification
}>()

const emit = defineEmits<{
  (e: 'markAsRead', id: string): void
  (e: 'delete', id: string): void
}>()

const formattedDate = computed(() => {
  return formatDistanceToNow(new Date(props.notification.createdAt), { addSuffix: true })
})

const notificationIcon = computed(() => {
  switch (props.notification.type) {
    case 'info':
      return 'pi-info-circle'
    case 'success':
      return 'pi-check-circle'
    case 'warning':
      return 'pi-exclamation-triangle'
    case 'error':
      return 'pi-times-circle'
    default:
      return 'pi-bell'
  }
})

const notificationColor = computed(() => {
  switch (props.notification.type) {
    case 'info':
      return 'text-info'
    case 'success':
      return 'text-success'
    case 'warning':
      return 'text-warning'
    case 'error':
      return 'text-error'
    default:
      return 'text-primary'
  }
})

const handleMarkAsRead = () => {
  emit('markAsRead', props.notification.id)
}

const handleDelete = (event: Event) => {
  event.stopPropagation()
  emit('delete', props.notification.id)
}
</script>

<template>
  <div 
    @click="handleMarkAsRead"
    :class="[
      themeStore.isDarkMode ? 'border-[#2d2d35]' : 'border-gray-200',
      'p-3 border-b hover:bg-opacity-50 cursor-pointer',
      !notification.isRead ? (themeStore.isDarkMode ? 'bg-[#232328]' : 'bg-gray-50') : ''
    ]"
  >
    <div class="flex items-start">
      <div class="mr-3 mt-1">
        <i :class="['pi', notificationIcon, notificationColor]"></i>
      </div>
      <div class="flex-1">
        <div class="flex justify-between">
          <h4 :class="[themeStore.isDarkMode ? 'text-white' : 'text-gray-800', 'font-medium']">{{ notification.title }}</h4>
          <div class="flex items-center">
            <span :class="[themeStore.isDarkMode ? 'text-gray-400' : 'text-gray-500', 'text-xs mr-2']">{{ formattedDate }}</span>
            <button 
              @click="handleDelete"
              :class="[themeStore.isDarkMode ? 'text-gray-400 hover:text-red-400' : 'text-gray-500 hover:text-red-600', 'transition-colors duration-200']"
            >
              <i class="pi pi-times"></i>
            </button>
          </div>
        </div>
        <p :class="[themeStore.isDarkMode ? 'text-gray-300' : 'text-gray-600', 'text-sm mt-1']">{{ notification.message }}</p>
      </div>
    </div>
  </div>
</template>
