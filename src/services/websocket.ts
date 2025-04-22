import { Client } from '@stomp/stompjs'
import type { Frame, IMessage } from '@stomp/stompjs'
import { useAuthStore } from '../stores/auth'
import { useNotificationsStore } from '../stores/notifications'
import { useMessage } from 'naive-ui'
import { WebSocketMessageType } from '../types/websocket-types.ts'
import type { WebSocketMessage } from '../types/websocket-types.ts'
import { ref, onUnmounted } from 'vue'

let stompClient: Client | null = null

/**
 * Vue composable for WebSocket functionality using STOMP
 * This provides a unified interface for both the raw WebSocket and STOMP client
 */
export function useWebSocket() {
  const isConnected = ref(false)
  const socket = ref<WebSocket | null>(null)
  const auth = useAuthStore()
  
  const connect = () => {
    if (!auth.isAuthenticated) {
      console.warn('WebSocket: user not authenticated, skip connect')
      return
    }
    
    if (stompClient && stompClient.active) {
      console.warn('WebSocket: already connected')
      isConnected.value = true
      return
    }
    
    const wsUrl = `${import.meta.env.VITE_API_WS_URL || 'ws://localhost:8081/api'}/ws?token=${auth.user!.token}`
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const fullUrl = wsUrl.replace(/^https?:/, wsProtocol)
    
    stompClient = new Client({
      brokerURL: fullUrl,
      debug: str => console.log(`[STOMP] ${str}`),
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: (frame: Frame) => {
        console.log('STOMP: connected', frame)
        isConnected.value = true
        socket.value = stompClient?.webSocket as WebSocket
        stompClient!.subscribe(
          `/queue/user.${auth.user!.id}`,
          onMessageReceived
        )
      },
      onStompError: frame => {
        console.error('STOMP protocol error', frame.headers['message'], frame.body)
        isConnected.value = false
      },
      onDisconnect: () => {
        isConnected.value = false
      },
      onWebSocketClose: () => {
        console.log('WebSocket connection closed')
        isConnected.value = false
      }
    })
    
    stompClient.activate()
  }
  
  const disconnect = () => {
    if (stompClient) {
      stompClient.deactivate()
      stompClient = null
      isConnected.value = false
      socket.value = null
      console.log('WebSocket: disconnected')
    }
  }
  
  const sendMessage = (type: WebSocketMessageType, data: any): boolean => {
    if (!stompClient || !stompClient.active) {
      console.warn('WebSocket: not connected')
      return false
    }
    
    try {
      const msg: WebSocketMessage = { type, data }
      stompClient.publish({
        destination: `/app/send/user.${auth.user!.id}`,
        body: JSON.stringify(msg)
      })
      return true
    } catch (e) {
      console.error('WebSocket: send error', e)
      return false
    }
  }
  
  onUnmounted(() => {
    disconnect()
  })
  
  return {
    connect,
    disconnect,
    sendMessage,
    isConnected,
    socket
  }
}

export function connectStomp(): void {
  const { connect } = useWebSocket()
  connect()
}

function onMessageReceived(msg: IMessage) {
  try {
    const payload: WebSocketMessage = JSON.parse(msg.body)
    const notificationsStore = useNotificationsStore()
    const notify = useMessage()

    switch (payload.type) {
      case WebSocketMessageType.NOTIFICATION:
        if (payload.data.notification) {
          notificationsStore.addNotification(payload.data.notification)
          notify.info(payload.data.notification.title, { duration: 5000, closable: true })
        }
        break

      case WebSocketMessageType.NOTIFICATION_UPDATE:
        notificationsStore.fetchNotifications()
        break

      case WebSocketMessageType.NOTIFICATION_READ:
        if (payload.data.id) {
          notificationsStore.updateNotificationReadStatus(payload.data.id, true)
        } else if (payload.data.all) {
          notificationsStore.updateAllNotificationsReadStatus(true)
        }
        break

      case WebSocketMessageType.NOTIFICATION_DELETE:
        if (payload.data.id) {
          notificationsStore.removeNotification(payload.data.id)
        }
        break

      case WebSocketMessageType.INTERVIEW_REMINDER:
        if (payload.data.interview) {
          const interview = payload.data.interview
          const title = payload.data.title ??
              `Interview Reminder: ${interview.companyName}`
          const body = payload.data.reminderLabel
              ? `${interview.position} interview at ${interview.time} (in ${payload.data.reminderLabel})`
              : `${interview.position} interview at ${interview.time}`
          notify.info(
              `${title}\n${body}`,
              {
                duration: 10000,
                closable: true
              }
          )
          notificationsStore.addNotification(payload.data.notification)
        }
        break


      case WebSocketMessageType.SYSTEM_MESSAGE:
        notify.info(payload.data.title || 'System Message', {
          duration: 5000,
          closable: true
        })
        break

      default:
        console.warn('STOMP: unknown message type', payload.type)
    }
  } catch (e) {
    console.error('STOMP: error handling message', e)
  }
}

export function sendStompMessage(
    type: WebSocketMessageType,
    data: any
): boolean {
  const { sendMessage } = useWebSocket()
  return sendMessage(type, data)
}

export function disconnectStomp(): void {
  const { disconnect } = useWebSocket()
  disconnect()
}

window.addEventListener('beforeunload', disconnectStomp)
