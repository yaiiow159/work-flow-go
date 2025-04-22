import { useMessage } from 'naive-ui'
import type { Notification } from '../types'
import { useNotificationsStore } from '../stores/notifications'
import { useWebSocket } from './websocket'
import { v4 as uuidv4 } from 'uuid'
import { WebSocketMessageType} from "../types/websocket-types.ts";

export const useNotificationService = () => {
  const message = useMessage()
  const notificationsStore = useNotificationsStore()
  const { sendMessage, isConnected } = useWebSocket()
  
  const showDesktopNotification = (title: string, body: string) => {
    try {
      if (!('Notification' in window)) {
        return
      }
      
      if (Notification.permission === 'granted') {
        new Notification(title, {
          body,
          icon: '/favicon.ico'
        })
      } 
      else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification(title, {
              body,
              icon: '/favicon.ico'
            })
          }
        })
      }
    } catch (error) {
      console.error('Error showing desktop notification:', error)
    }
  }
  
  const saveNotificationLocally = async (notificationData: {
    title: string
    message: string
    type: 'info' | 'success' | 'warning' | 'error'
    relatedEntityId?: string
    relatedEntityType?: 'interview' | 'document' | 'system'
  }) => {
    try {
      if (notificationsStore) {
        const notification: Omit<Notification, 'id'> = {
          userId: 'current',
          title: notificationData.title,
          message: notificationData.message,
          type: notificationData.type,
          isRead: false,
          createdAt: new Date().toISOString(),
          relatedEntityId: notificationData.relatedEntityId,
          relatedEntityType: notificationData.relatedEntityType
        }
        
        try {
          await notificationsStore.createNotification(notification)
        } catch (error) {
          console.warn('Could not save notification, adding to local store only', error)
          notificationsStore.addNotification({
            ...notification,
            id: `local-${uuidv4()}`
          })
        }
      }
    } catch (error) {
      console.error('Error saving notification:', error)
    }
  }
  
  const sendNotification = (notificationData: {
    title: string
    message: string
    type: 'info' | 'success' | 'warning' | 'error'
    relatedEntityId?: string
    relatedEntityType?: 'interview' | 'document' | 'system'
  }) => {
    try {
      message.info(
        notificationData.title,
        { duration: 5000, closable: true }
      )
      
      showDesktopNotification(notificationData.title, notificationData.message)
      
      if (isConnected.value) {
        return sendMessage(WebSocketMessageType.NOTIFICATION, {
          notification: {
            userId: 'current',
            title: notificationData.title,
            message: notificationData.message,
            type: notificationData.type,
            isRead: false,
            createdAt: new Date().toISOString(),
            relatedEntityId: notificationData.relatedEntityId,
            relatedEntityType: notificationData.relatedEntityType
          }
        })
      } else {
        saveNotificationLocally(notificationData)
        return false
      }
    } catch (error) {
      console.error('Error sending notification:', error)
      return false
    }
  }
  
  const notifyUpcomingInterview = (interview: any) => {
    try {
      const reminderLabel = interview.reminderLabel || '1 day'
      const title = `Interview Reminder: ${interview.companyName}`
      const message = `${interview.position} interview at ${interview.time} (in ${reminderLabel})`
      
      sendNotification({
        title,
        message,
        type: 'info',
        relatedEntityId: interview.id,
        relatedEntityType: 'interview'
      })
    } catch (error) {
      console.error('Error sending interview reminder notification:', error)
    }
  }
  
  return {
    showDesktopNotification,
    sendNotification,
    saveNotificationLocally,
    notifyUpcomingInterview
  }
}
