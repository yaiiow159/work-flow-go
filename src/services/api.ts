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
    const formData = new FormData()
    formData.append('name', document.name || '')
    
    if (document.file) {
      formData.append('file', document.file)
    }
    
    const response = await axiosInstance.put<Document>(`/documents/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  },

  delete: async (id: string) => {
    await axiosInstance.delete(`/documents/${id}`)
  },
  
  getDownloadUrl: async (id: string) => {
    try {
      const baseURL = import.meta.env.VITE_API_URL || '';
      return `${baseURL}/documents/${id}/download?t=${Date.now()}`
    } catch (error) {
      console.error('Error getting download URL:', error)
      throw error
    }
  },
  
  getViewUrl: async (id: string) => {
    try {
      const baseURL = import.meta.env.VITE_API_URL || '';
      return `${baseURL}/documents/${id}/view?t=${Date.now()}`
    } catch (error) {
      console.error('Error getting view URL:', error)
      throw error
    }
  },
  
  downloadFile: async (id: string) => {
    try {
      const response = await axiosInstance.get(`/documents/${id}/file`, {
        responseType: 'blob'
      })
      
      const blob = new Blob([response.data], {
        type: response.headers['content-type'] 
      })
      const url = window.URL.createObjectURL(blob)
      
      const contentDisposition = response.headers['content-disposition']
      let filename = 'document'
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/)
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1]
        }
      }
      
      const contentType = response.headers['content-type']
      if (contentType && !filename.includes('.')) {
        const extension = contentType.split('/')[1]
        if (extension) {
          const extensionMap: Record<string, string> = {
            'png': 'png',
            'jpeg': 'jpg',
            'jpg': 'jpg',
            'pdf': 'pdf',
            'plain': 'txt',
            'msword': 'doc',
            'vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
            'vnd.ms-excel': 'xls',
            'vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx'
          }
          
          const mappedExtension = extensionMap[extension] || extension
          filename = `${filename}.${mappedExtension}`
        }
      }
      
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      
      window.URL.revokeObjectURL(url)
      document.body.removeChild(link)
      
      return true
    } catch (error) {
      console.error('Error downloading file:', error)
      throw error
    }
  },
  
  getCount: async () => {
    const response = await axiosInstance.get<number>('/documents/count')
    return response.data
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
    const response = await axiosInstance.post<string>('/users/profile/change-password', passwordChangeRequest)
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
    
    try {
      const response = await axiosInstance.post('/users/profile/profile-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      const photoURL = typeof response.data === 'string' ? response.data : null
      
      return {
        success: true,
        userId: response.data.userId || response.data.id || null,
        photoURL: photoURL
      }
    } catch (error) {
      console.error('Error uploading profile image:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  },

  getUserProfile: async () => {
    const response = await axiosInstance.get<UserProfileDTO>('/users/profile')
    return response.data
  },

  updateUserProfile: async (profileData: UserProfileRequest) => {
    const response = await axiosInstance.put<UserProfileDTO>('/users/profile', profileData)
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

export function useUserSettingsApi() {
  return userSettingsApi
}

export function useUserApi() {
  return userApi
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
  create: async (notification: Omit<Notification, 'id'>): Promise<Notification> => {
    const response = await axiosInstance.post<Notification>('/notifications', notification)
    return response.data
  },

  getAll: async (): Promise<Notification[]> => {
    const response = await axiosInstance.get<Notification[]>('/notifications')
    return response.data
  },

  markAsRead: async (id: string): Promise<boolean> => {
    const response = await axiosInstance.patch<{ success: boolean }>(`/notifications/${id}/read`)
    return response.data.success
  },

  markAllAsRead: async (): Promise<boolean> => {
    const response = await axiosInstance.patch<{ success: boolean }>('/notifications/read-all')
    return response.data.success
  },

  delete: async (id: string): Promise<boolean> => {
    const response = await axiosInstance.delete<void>(`/notifications/${id}`)
    return response.status >= 200 && response.status < 300
  },

  getUnreadCount: async (): Promise<number> => {
    const response = await axiosInstance.get<{ count: number }>('/notifications/unread-count')
    return response.data.count
  }
}
