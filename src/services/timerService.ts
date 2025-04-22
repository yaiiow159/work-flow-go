import { ref, computed } from 'vue'
import { useInterviewStore } from '../stores/interview'
import type{ Interview } from '../types'
import { differenceInMinutes, differenceInHours, differenceInDays, parseISO } from 'date-fns'
import { userSettingsApi } from '../services/api'

type TimeoutId = ReturnType<typeof setTimeout>

export const useTimerService = () => {
  const interviewStore = useInterviewStore()
  const activeReminders = ref<Map<string, TimeoutId>>(new Map())
  
  const getTimeRemaining = (interview: Interview) => {
    try {
      const interviewDateTime = parseISO(`${interview.date}T${interview.time}`)
      const now = new Date()
      
      const minutesRemaining = differenceInMinutes(interviewDateTime, now)
      const hoursRemaining = differenceInHours(interviewDateTime, now)
      const daysRemaining = differenceInDays(interviewDateTime, now)
      
      return {
        minutes: minutesRemaining,
        hours: hoursRemaining,
        days: daysRemaining,
        isPast: minutesRemaining < 0,
        interviewDateTime
      }
    } catch (error) {
      console.error('Error calculating time remaining:', error)
      return {
        minutes: 0,
        hours: 0,
        days: 0,
        isPast: true,
        interviewDateTime: new Date()
      }
    }
  }
  
  const formatTimeRemaining = (interview: Interview) => {
    try {
      const { minutes, hours, days, isPast } = getTimeRemaining(interview)
      
      if (isPast) {
        return 'Past'
      }
      
      if (days > 0) {
        return `${days} day${days > 1 ? 's' : ''}`
      }
      
      if (hours > 0) {
        return `${hours} hour${hours > 1 ? 's' : ''}`
      }
      
      return `${minutes} minute${minutes !== 1 ? 's' : ''}`
    } catch (error) {
      console.error('Error formatting time remaining:', error)
      return 'Unknown'
    }
  }
  
  const upcomingWithRemaining = computed(() => {
    try {
      return interviewStore.upcomingInterviews.map(interview => ({
        ...interview,
        timeRemaining: formatTimeRemaining(interview),
        ...getTimeRemaining(interview)
      }))
    } catch (error) {
      console.error('Error computing upcoming interviews with remaining time:', error)
      return []
    }
  })
  
  const setupReminders = async (callback: (interview: Interview & { reminderLabel?: string }) => void) => {
    try {
      clearAllReminders()
      
      let userReminderTime = '1day'
      try {
        const userSettings = await userSettingsApi.get()
        userReminderTime = userSettings.preferences?.notifications?.reminderTime || '1day'
      } catch (error) {
        console.warn('Could not fetch user settings, using default reminder time:', error)
      }
      
      interviewStore.upcomingInterviews.forEach(interview => {
        const { minutes, isPast } = getTimeRemaining(interview)
        
        if (isPast) return
        
        let reminderTimes = []
        
        const getReminderMinutes = (setting: string): number => {
          switch (setting) {
            case '30min': return 30
            case '1hour': return 60
            case '3hours': return 180
            case '1day': return 24 * 60
            case '2days': return 48 * 60
            default: return 24 * 60 // Default to 1 day
          }
        }
        
        const getReminderLabel = (setting: string): string => {
          switch (setting) {
            case '30min': return '30 minutes'
            case '1hour': return '1 hour'
            case '3hours': return '3 hours'
            case '1day': return '1 day'
            case '2days': return '2 days'
            default: return '1 day'
          }
        }
        
        const userReminderMinutes = getReminderMinutes(userReminderTime)
        reminderTimes = [
          { minutes: userReminderMinutes, label: getReminderLabel(userReminderTime) }
        ]
        
        if (userReminderMinutes > 5) {
          reminderTimes.push({ minutes: 5, label: '5 minutes' })
        }
        
        reminderTimes.forEach(reminder => {
          const timeToReminder = minutes - reminder.minutes
          
          if (timeToReminder > 0) {
            const timerId = setTimeout(() => {
              callback({
                ...interview,
                reminderLabel: reminder.label
              })
              activeReminders.value.delete(`${interview.id}-${reminder.label}`)
            }, timeToReminder * 60 * 1000)
            
            activeReminders.value.set(`${interview.id}-${reminder.label}`, timerId)
          }
        })
      })
    } catch (error) {
      console.error('Error setting up reminders:', error)
    }
  }
  
  const clearAllReminders = () => {
    try {
      activeReminders.value.forEach(timerId => {
        clearTimeout(timerId)
      })
      activeReminders.value.clear()
    } catch (error) {
      console.error('Error clearing reminders:', error)
    }
  }
  
  const clearRemindersForInterview = (interviewId: string) => {
    try {
      activeReminders.value.forEach((timerId, key) => {
        if (key.startsWith(`${interviewId}-`)) {
          clearTimeout(timerId)
          activeReminders.value.delete(key)
        }
      })
    } catch (error) {
      console.error('Error clearing reminders for interview:', error)
    }
  }
  
  return {
    getTimeRemaining,
    formatTimeRemaining,
    upcomingWithRemaining,
    setupReminders,
    clearAllReminders,
    clearRemindersForInterview
  }
}
