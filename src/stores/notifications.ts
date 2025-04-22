import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Notification } from '../types'
import { notificationsApi } from '../services/api'
import { v4 as uuidv4 } from 'uuid'

export const useNotificationsStore = defineStore('notifications', () => {
  const notifications = ref<Notification[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const unreadCount = computed(() =>
      notifications.value.filter(n => !n.isRead).length
  )

  async function withLoading<T>(action: () => Promise<T>, fallback: T): Promise<T> {
    loading.value = true
    error.value = null
    try {
      return await action()
    } catch (err: any) {
      error.value = err?.message || 'An error occurred'
      return fallback
    } finally {
      loading.value = false
    }
  }

  const fetchNotifications = async (): Promise<boolean> => {
    const result = await withLoading(() => notificationsApi.getAll(), [] as Notification[])
    notifications.value = result as Notification[]
    return error.value === null
  }

  const createNotification = async (
      notification: Omit<Notification, 'id'>
  ): Promise<Notification | null> => {
    try {
      const newNotification = await withLoading(
          () => notificationsApi.create(notification),
          null
      )
      
      if (newNotification) {
        addNotification(newNotification)
        return newNotification
      }
      
      const localNotification: Notification = {
        ...notification,
        id: `local-${uuidv4()}`
      }
      
      addNotification(localNotification)
      return localNotification
    } catch (error) {
      console.error('Failed to create notification:', error)
      return null
    }
  }

  const addNotification = (notification: Notification): void => {
    if (!notifications.value.some(n => n.id === notification.id)) {
      notifications.value.unshift(notification)
    }
  }

  const updateNotificationReadStatus = (id: string, isRead: boolean): void => {
    const notification = notifications.value.find(n => n.id === id)
    if (notification) {
      notification.isRead = isRead
    }
  }

  const updateAllNotificationsReadStatus = (isRead: boolean): void => {
    notifications.value = notifications.value.map(n => ({ ...n, isRead }))
  }

  const removeNotification = (id: string): void => {
    notifications.value = notifications.value.filter(n => n.id !== id)
  }

  const markAsRead = async (id: string): Promise<boolean> => {
    try {
      const success = await withLoading(() => notificationsApi.markAsRead(id), false)
      if (success) {
        updateNotificationReadStatus(id, true)
        return true
      }
      return false
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
      return false
    }
  }

  const markAllAsRead = async (): Promise<boolean> => {
    try {
      const success = await withLoading(() => notificationsApi.markAllAsRead(), false)
      if (success) {
        updateAllNotificationsReadStatus(true)
        return true
      }
      return false
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
      return false
    }
  }

  const deleteNotification = async (id: string): Promise<boolean> => {
    try {
      const success = await withLoading(() => notificationsApi.delete(id), false)
      if (success) {
        removeNotification(id)
        return true
      }
      return false
    } catch (error) {
      console.error('Failed to delete notification:', error)
      return false
    }
  }

  const fetchUnreadCount = async (): Promise<number> => {
    return await withLoading(() => notificationsApi.getUnreadCount(), 0)
  }

  const clearNotifications = (): void => {
    notifications.value = []
    error.value = null
  }

  return {
    notifications,
    loading,
    error,
    unreadCount,
    fetchNotifications,
    createNotification,
    addNotification,
    updateNotificationReadStatus,
    updateAllNotificationsReadStatus,
    removeNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    fetchUnreadCount,
    clearNotifications
  }
})
