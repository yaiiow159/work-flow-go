// src/stores/notifications.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Notification } from '../types'
import { notificationsApi } from '../services/api'
import { v4 as uuidv4 } from 'uuid'
import { WebSocketMessageType } from '../types/websocket-types'
import {useWebSocket} from "../services/websocket.ts";

export const useNotificationsStore = defineStore('notifications', () => {
  const notifications = ref<Notification[]>([])
  const loading       = ref(false)
  const error         = ref<string | null>(null)

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
    const result = await withLoading(
        () => notificationsApi.getAll(),
        [] as Notification[]
    )
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
    } catch {
      return null
    }
  }

  const addNotification = (n: Notification) => {
    if (!notifications.value.some(x => x.id === n.id)) {
      notifications.value.unshift(n)
    }
  }

  const updateNotificationReadStatus = (id: string, isRead: boolean) => {
    const found = notifications.value.find(x => x.id === id)
    if (found) found.isRead = isRead
  }

  const updateAllNotificationsReadStatus = (isRead: boolean) => {
    notifications.value.forEach(x => (x.isRead = isRead))
  }

  const removeNotification = (id: string) => {
    notifications.value = notifications.value.filter(x => x.id !== id)
  }

  const markAsRead = async (id: string): Promise<boolean> => {
    const success = await withLoading(() => notificationsApi.markAsRead(id), false)
    if (success) {
      updateNotificationReadStatus(id, true)
      const { sendMessage, isConnected } = useWebSocket()
      if (isConnected.value) {
        sendMessage(WebSocketMessageType.NOTIFICATION_READ, { id })
      }
    }
    return success
  }

  const markAllAsRead = async (): Promise<boolean> => {
    const success = await withLoading(() => notificationsApi.markAllAsRead(), false)
    if (success) {
      updateAllNotificationsReadStatus(true)
      const { sendMessage, isConnected } = useWebSocket()
      if (isConnected.value) {
        sendMessage(WebSocketMessageType.NOTIFICATION_READ, { all: true })
      }
    }
    return success
  }

  const deleteNotification = async (id: string): Promise<boolean> => {
    const success = await withLoading(() => notificationsApi.delete(id), false)
    if (success) {
      removeNotification(id)
      const { sendMessage, isConnected } = useWebSocket()
      if (isConnected.value) {
        sendMessage(WebSocketMessageType.NOTIFICATION_DELETE, { id })
      }
    }
    return success
  }

  const fetchUnreadCount = async (): Promise<number> => {
    return await withLoading(() => notificationsApi.getUnreadCount(), 0)
  }

  const clearNotifications = () => {
    notifications.value = []
    error.value = null
  }

  const { connect, disconnect} = useWebSocket()

  function initWebSocket() {
    connect()
  }

  function teardownWebSocket() {
    disconnect()
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
    clearNotifications,
    initWebSocket,
    teardownWebSocket
  }
})
