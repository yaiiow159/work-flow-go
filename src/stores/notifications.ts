import {defineStore} from 'pinia'
import {computed, ref} from 'vue'
import type {Notification} from '../types'
import {notificationsApi} from '../services/api'

export const useNotificationsStore = defineStore('notifications', () => {
  const notifications = ref<Notification[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  const unreadCount = computed(() => 
    notifications.value.filter(notification => !notification.isRead).length
  )
  
  const fetchNotifications = async () => {
    loading.value = true
    error.value = null
    
    try {
      try {
        notifications.value = await notificationsApi.getAll()
      } catch (apiError) {
        console.warn('API error:', apiError)
        notifications.value = []
      }
      return true
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch notifications'
      return false
    } finally {
      loading.value = false
    }
  }
  
  const createNotification = async (notification: Omit<Notification, 'id'>) => {
    loading.value = true
    error.value = null
    
    try {
      const newNotification = await notificationsApi.create(notification)
      notifications.value.unshift(newNotification)
      return newNotification
    } catch (err: any) {
      error.value = err.message || 'Failed to create notification'
      throw err
    } finally {
      loading.value = false
    }
  }
  
  const markAsRead = async (id: string) => {
    try {
      await notificationsApi.markAsRead(id)
      const index = notifications.value.findIndex(n => n.id === id)
      if (index !== -1) {
        notifications.value[index].isRead = true
      }
      return true
    } catch (err: any) {
      error.value = err.message || 'Failed to mark notification as read'
      return false
    }
  }
  
  const markAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead()
      notifications.value = notifications.value.map(n => ({ ...n, isRead: true }))
      return true
    } catch (err: any) {
      error.value = err.message || 'Failed to mark all notifications as read'
      return false
    }
  }
  
  const deleteNotification = async (id: string) => {
    try {
      await notificationsApi.delete(id)
      notifications.value = notifications.value.filter(n => n.id !== id)
      return true
    } catch (err: any) {
      error.value = err.message || 'Failed to delete notification'
      return false
    }
  }
  
  const getUnreadCount = async () => {
    try {
      return await notificationsApi.getUnreadCount()
    } catch (err: any) {
      error.value = err.message || 'Failed to get unread count'
      return 0
    }
  }
  
  return {
    notifications,
    loading,
    error,
    unreadCount,
    fetchNotifications,
    createNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getUnreadCount
  }
})
