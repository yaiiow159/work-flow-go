import { useMessage } from 'naive-ui'
import type{ Interview, Notification } from '../types'
import { useNotificationsStore } from '../stores/notifications'
import { v4 as uuidv4 } from 'uuid'

export const useNotificationService = () => {
  const message = useMessage()
  const notificationsStore = useNotificationsStore()
  
  const showInterviewReminder = (interview: Interview & { reminderLabel?: string }) => {
    try {
      const reminderText = interview.reminderLabel 
        ? `${interview.reminderLabel} until your interview` 
        : 'Upcoming interview'
      
      message.info(`${reminderText} with ${interview.companyName}: ${interview.position} interview at ${interview.time}`, {
        duration: 10000,
        closable: true
      })
      
      saveNotification({
        title: `${reminderText} with ${interview.companyName}`,
        message: `${interview.position} interview at ${interview.time}`,
        type: 'info',
        relatedEntityId: interview.id,
        relatedEntityType: 'interview'
      })
    } catch (error) {
      console.error('Error showing interview reminder:', error)
    }
  }
  
  const showDesktopNotification = (interview: Interview & { reminderLabel?: string }) => {
    try {
      if (!('Notification' in window)) {
        return
      }
      
      const reminderText = interview.reminderLabel 
        ? `${interview.reminderLabel} until your interview` 
        : 'Upcoming interview'
      
      if (Notification.permission === 'granted') {
        new Notification(`${reminderText} with ${interview.companyName}`, {
          body: `${interview.position} interview at ${interview.time}`,
          icon: '/favicon.ico'
        })
      } 
      else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification(`${reminderText} with ${interview.companyName}`, {
              body: `${interview.position} interview at ${interview.time}`,
              icon: '/favicon.ico'
            })
          }
        })
      }
    } catch (error) {
      console.error('Error showing desktop notification:', error)
    }
  }
  
  const saveNotification = async (notificationData: {
    title: string
    message: string
    type: 'info' | 'success' | 'warning' | 'error'
    relatedEntityId?: string
    relatedEntityType?: 'interview' | 'document' | 'system'
  }) => {
    try {
      if (notificationsStore && 'notifications' in notificationsStore) {
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
        } catch (apiError) {
          console.warn('Could not save notification to API, adding to local store only', apiError)
          if (Array.isArray(notificationsStore.notifications)) {
            notificationsStore.notifications.unshift({
              ...notification,
              id: uuidv4()
            })
          }
        }
      }
    } catch (error) {
      console.error('Error saving notification:', error)
    }
  }
  
  const notifyUpcomingInterview = (interview: Interview & { reminderLabel?: string }) => {
    try {
      showInterviewReminder(interview)
      showDesktopNotification(interview)
    } catch (error) {
      console.error('Error notifying upcoming interview:', error)
    }
  }
  
  return {
    showInterviewReminder,
    showDesktopNotification,
    notifyUpcomingInterview,
    saveNotification
  }
}
