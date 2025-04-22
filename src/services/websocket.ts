import { ref, onBeforeUnmount } from 'vue'
import { useNotificationsStore } from '../stores/notifications'
import { useAuthStore } from '../stores/auth'
import { useMessage } from 'naive-ui'

const isConnected = ref(false)
const isConnecting = ref(false)
const socket = ref<WebSocket | null>(null)
const reconnectAttempts = ref(0)
const maxReconnectAttempts = 5
const reconnectDelay = 3000

export enum WebSocketMessageType {
  NOTIFICATION = 'notification',
  NOTIFICATION_UPDATE = 'notification_update',
  NOTIFICATION_READ = 'notification_read',
  NOTIFICATION_DELETE = 'notification_delete',
  INTERVIEW_REMINDER = 'interview_reminder',
  SYSTEM_MESSAGE = 'system_message'
}

export interface WebSocketMessage {
  type: WebSocketMessageType;
  data: any;
}

const getWebSocketUrl = () => {
  const baseUrl = import.meta.env.VITE_API_WS_URL || 'ws://localhost:8081/api'
  return `${baseUrl}/ws`
}

const connect = () => {
  const authStore = useAuthStore()
  
  if (!authStore.isAuthenticated) {
    console.warn('Cannot connect to WebSocket: User not authenticated')
    return
  }
  
  if (isConnected.value || isConnecting.value) {
    return
  }
  
  isConnecting.value = true
  
  try {
    const wsUrl = `${getWebSocketUrl()}?token=${authStore.user?.token || ''}`
    socket.value = new WebSocket(wsUrl)
    
    socket.value.onopen = () => {
      isConnected.value = true
      isConnecting.value = false
      reconnectAttempts.value = 0
      console.log('WebSocket connection established')
    }
    
    socket.value.onclose = () => {
      isConnected.value = false
      isConnecting.value = false
      
      if (reconnectAttempts.value < maxReconnectAttempts) {
        reconnectAttempts.value++
        setTimeout(connect, reconnectDelay)
      }
    }
    
    socket.value.onerror = (error) => {
      console.error('WebSocket error:', error)
      isConnected.value = false
      isConnecting.value = false
    }
    
    socket.value.onmessage = handleMessage
  } catch (error) {
    console.error('Failed to connect to WebSocket:', error)
    isConnecting.value = false
  }
}

const disconnect = () => {
  if (socket.value && (isConnected.value || isConnecting.value)) {
    socket.value.close()
    socket.value = null
    isConnected.value = false
    isConnecting.value = false
  }
}

const handleMessage = (event: MessageEvent) => {
  try {
    const message: WebSocketMessage = JSON.parse(event.data)
    const notificationsStore = useNotificationsStore()
    const messageApi = useMessage()
    
    switch (message.type) {
      case WebSocketMessageType.NOTIFICATION:
        if (message.data.notification) {
          notificationsStore.addNotification(message.data.notification)
          
          messageApi.info(
            message.data.notification.title,
            { duration: 5000, closable: true }
          )
          
          showDesktopNotification(message.data.notification)
        }
        break
      
      case WebSocketMessageType.NOTIFICATION_UPDATE:
        notificationsStore.fetchNotifications()
        break
        
      case WebSocketMessageType.NOTIFICATION_READ:
        if (message.data.id) {
          notificationsStore.updateNotificationReadStatus(message.data.id, true)
        } else if (message.data.all) {
          notificationsStore.updateAllNotificationsReadStatus(true)
        }
        break
        
      case WebSocketMessageType.NOTIFICATION_DELETE:
        if (message.data.id) {
          notificationsStore.removeNotification(message.data.id)
        }
        break
        
      case WebSocketMessageType.INTERVIEW_REMINDER:
        if (message.data.interview) {
          const interview = message.data.interview
          const title = message.data.title || `Interview Reminder: ${interview.companyName}`
          const body = message.data.message || `${interview.position} interview at ${interview.time}`
          
          messageApi.info(
            title,
            { duration: 10000, closable: true }
          )
          
          showDesktopNotification({
            title: title,
            message: body,
            type: 'info'
          })
          
          if (message.data.notification) {
            notificationsStore.addNotification(message.data.notification)
          } else {
            notificationsStore.addNotification({
              id: message.data.id || crypto.randomUUID(),
              userId: 'current',
              title: title,
              message: body,
              type: 'info',
              isRead: false,
              createdAt: new Date().toISOString(),
              relatedEntityId: interview.id,
              relatedEntityType: 'interview'
            })
          }
        }
        break;
        
      case WebSocketMessageType.SYSTEM_MESSAGE:
        if (message.data.message) {
          messageApi.info(
            message.data.title || 'System Message',
            { duration: 5000, closable: true }
          )
        }
        break;
        
      default:
        console.log('Unknown WebSocket message type:', message.type)
    }
  } catch (error) {
    console.error('Error handling WebSocket message:', error)
  }
}

const showDesktopNotification = (notification: { title: string, message: string, type: string }) => {
  try {
    if (!('Notification' in window)) {
      return
    }
    
    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico'
      })
    } 
    else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification(notification.title, {
            body: notification.message,
            icon: '/favicon.ico'
          })
        }
      })
    }
  } catch (error) {
    console.error('Error showing desktop notification:', error)
  }
}

const sendMessage = (type: WebSocketMessageType, data: any) => {
  if (!isConnected.value || !socket.value) {
    console.warn('Cannot send message: WebSocket not connected')
    return false
  }
  
  try {
    const message: WebSocketMessage = {
      type,
      data
    }
    
    socket.value.send(JSON.stringify(message))
    return true
  } catch (error) {
    console.error('Error sending WebSocket message:', error)
    return false
  }
}

const markNotificationAsRead = (id: string) => {
  return sendMessage(WebSocketMessageType.NOTIFICATION_READ, { id })
}

const markAllNotificationsAsRead = () => {
  return sendMessage(WebSocketMessageType.NOTIFICATION_READ, { all: true })
}

const deleteNotification = (id: string) => {
  return sendMessage(WebSocketMessageType.NOTIFICATION_DELETE, { id })
}

window.addEventListener('beforeunload', () => {
  disconnect()
})

export const useWebSocket = () => {
  onBeforeUnmount(() => {
    disconnect()
  })
  
  return {
    isConnected,
    isConnecting,
    connect,
    disconnect,
    sendMessage,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification
  }
}
