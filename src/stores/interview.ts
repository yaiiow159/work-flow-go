import {defineStore} from 'pinia'
import {computed, ref} from 'vue'
import type {Interview, InterviewStatus} from '../types'
import {interviewsApi} from '../services/api'

export const useInterviewStore = defineStore('interview', () => {
  const interviews = ref<Interview[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Computed properties
  const upcomingInterviews = computed(() => {
    return interviews.value
      .filter(interview => interview.status === 'scheduled' || interview.status === 'confirmed')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  })

  const pastInterviews = computed(() => {
    return interviews.value
      .filter(interview => interview.status === 'completed' || interview.status === 'rejected' || interview.status === 'cancelled')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  })

  const interviewsByStatus = computed(() => {
    const result: Record<InterviewStatus, Interview[]> = {
      scheduled: [],
      confirmed: [],
      completed: [],
      rejected: [],
      cancelled: []
    }
    
    interviews.value.forEach(interview => {
      result[interview.status].push(interview)
    })
    
    return result
  })

  // Actions
  async function fetchInterviews() {
    isLoading.value = true
    error.value = null
    
    try {
      interviews.value = await interviewsApi.getAll()
    } catch (err) {
      error.value = 'Failed to fetch interviews'
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }

  async function getInterviewById(id: string) {
    isLoading.value = true
    error.value = null
    
    try {
      return await interviewsApi.getById(id)
    } catch (err) {
      error.value = 'Failed to fetch interview details'
      console.error(err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function createInterview(interview: Omit<Interview, 'id'>) {
    isLoading.value = true
    error.value = null
    
    try {
      const data = await interviewsApi.create(interview)
      interviews.value.push(data)
      return data
    } catch (err) {
      error.value = 'Failed to create interview'
      console.error(err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function updateInterview(id: string, interview: Partial<Interview>) {
    isLoading.value = true
    error.value = null
    
    try {
      const data = await interviewsApi.update(id, interview)
      const index = interviews.value.findIndex(i => i.id === id)
      if (index !== -1) {
        interviews.value[index] = data
      }
      return data
    } catch (err) {
      error.value = 'Failed to update interview'
      console.error(err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function deleteInterview(id: string) {
    isLoading.value = true
    error.value = null
    
    try {
      await interviewsApi.delete(id)
      interviews.value = interviews.value.filter(i => i.id !== id)
      return true
    } catch (err) {
      error.value = 'Failed to delete interview'
      console.error(err)
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function updateInterviewStatus(id: string, status: InterviewStatus) {
    isLoading.value = true
    error.value = null
    
    try {
      const data = await interviewsApi.updateStatus(id, status)
      const index = interviews.value.findIndex(i => i.id === id)
      if (index !== -1) {
        interviews.value[index] = data
      }
      return data
    } catch (err) {
      error.value = 'Failed to update interview status'
      console.error(err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  return {
    interviews,
    isLoading,
    error,
    upcomingInterviews,
    pastInterviews,
    interviewsByStatus,
    fetchInterviews,
    getInterviewById,
    createInterview,
    updateInterview,
    deleteInterview,
    updateInterviewStatus
  }
})
