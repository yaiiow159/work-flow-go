import axiosInstance from './axiosInstance'
import type {Document, Interview, Notification, UserInfo, UserProfileDTO, UserProfileRequest, UserSettingsDTO, UserSettingsRequest, PasswordChangeRequest} from '../types'

export const interviewsApi = {
  getAll: async (params?: {
    status?: string
    from?: string
    to?: string
    company?: string
    sort?: string
    order?: 'asc' | 'desc'
  }) => {
    const response = await axiosInstance.get<Interview[]>('/interviews', { params })
    return response.data
  },

  getById: async (id: string) => {
    const response = await axiosInstance.get<Interview>(`/interviews/${id}`)
    return response.data
  },

  create: async (interview: Omit<Interview, 'id' | 'createdAt' | 'updatedAt'>) => {
    const interviewData = {
      ...interview,
      documentIds: interview.documentIds || interview.documents?.map(doc => doc.id) || []
    }
    
    const response = await axiosInstance.post<Interview>('/interviews', interviewData)
    return response.data
  },

  update: async (id: string, interview: Partial<Interview>) => {
    const interviewData = {
      ...interview,
      documentIds: interview.documentIds || interview.documents?.map(doc => doc.id) || []
    }
    
    const response = await axiosInstance.put<Interview>(`/interviews/${id}`, interviewData)
    return response.data
  },

  updateStatus: async (id: string, status: string) => {
    const response = await axiosInstance.patch<Interview>(`/interviews/${id}/status`, { status })
    return response.data
  },

  delete: async (id: string) => {
    await axiosInstance.delete(`/interviews/${id}`)
  }
}

export const documentsApi = {
  getAll: async () => {
    const response = await axiosInstance.get<Document[]>('/documents')
    return response.data
  },

  upload: async (file: File, name: string, type: string) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('name', name)
    formData.append('type', type)

    const response = await axiosInstance.post<Document>('/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  },

  getById: async (id: string) => {
    const response = await axiosInstance.get<Document>(`/documents/${id}`)
    return response.data
  },
  
  update: async (id: string, document: Partial<Document>) => {
    const response = await axiosInstance.put<Document>(`/documents/${id}`, document)
    return response.data
  },

  delete: async (id: string) => {
    await axiosInstance.delete(`/documents/${id}`)
  },
  
  getDownloadUrl: async (id: string) => {
    try {
      const response = await axiosInstance.get<{ url: string }>(`/documents/${id}/download-url`, {
        responseType: 'json'
      })
      return response.data.url
    } catch (error) {
      console.error('Error getting download URL:', error)
      throw error
    }
  },
  
  getViewUrl: async (id: string) => {
    try {
      const response = await axiosInstance.get<{ url: string }>(`/documents/${id}/view-url`, {
        responseType: 'json'
      })
      return response.data.url
    } catch (error) {
      console.error('Error getting view URL:', error)
      throw error
    }
  }
}

export const userApi = {
  getCurrentUser: async () => {
    const response = await axiosInstance.get<UserInfo>('/user/me')
    return response.data
  },
  
  getUserProfile: async () => {
    const response = await axiosInstance.get<UserProfileDTO>('/users/profile')
    return response.data
  },
  
  updateUserProfile: async (profileData: UserProfileRequest) => {
    const response = await axiosInstance.put<UserProfileDTO>('/users/profile', profileData)
    return response.data
  },
  
  changePassword: async (passwordChangeRequest: PasswordChangeRequest) => {
    const response = await axiosInstance.post<string>('/user/change-password', passwordChangeRequest)
    return response.data
  }
}

export const userSettingsApi = {
  get: async () => {
    const response = await axiosInstance.get<UserSettingsDTO>('/user/settings')
    return response.data
  },

  update: async (settingsRequest: UserSettingsRequest) => {
    const response = await axiosInstance.put<UserSettingsDTO>('/user/settings', settingsRequest)
    return response.data
  },

  uploadProfileImage: async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await axiosInstance.post<UserProfileDTO>('/users/profile/profile-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  },

  exportData: async () => {
    const response = await axiosInstance.get('/user/export', {
      responseType: 'blob'
    })
    return response.data
  },
  
  resetSettings: async () => {
    const response = await axiosInstance.post<UserSettingsDTO>('/user/settings/reset')
    return response.data
  }
}

export const statisticsApi = {
  getInterviewStats: async (params?: {
    from?: string
    to?: string
  }) => {
    const response = await axiosInstance.get('/statistics/interviews', { params })
    return response.data
  }
}

export const notificationsApi = {

  create: async (notification: Omit<Notification, 'id'>) => {
    const response = await axiosInstance.post<Notification>('/notifications', notification)
    return response.data
  },

  getAll: async () => {
    const response = await axiosInstance.get<Notification[]>('/notifications')
    return response.data
  },

  markAsRead: async (id: string) => {
    const response = await axiosInstance.patch<Notification>(`/notifications/${id}/read`)
    return response.data
  },

  markAllAsRead: async () => {
    const response = await axiosInstance.patch<{ success: boolean }>('/notifications/read-all')
    return response.data
  },

  delete: async (id: string) => {
    await axiosInstance.delete(`/notifications/${id}`)
  },

  getUnreadCount: async () => {
    const response = await axiosInstance.get<{ count: number }>('/notifications/unread-count')
    return response.data.count
  }
}
