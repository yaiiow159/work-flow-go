import axiosInstance from './axiosInstance'
import type {Document, Interview, User} from '../types'

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
    const response = await axiosInstance.post<Interview>('/interviews', interview)
    return response.data
  },

  update: async (id: string, interview: Partial<Interview>) => {
    const response = await axiosInstance.put<Interview>(`/interviews/${id}`, interview)
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
  
  getDownloadUrl: (id: string) => {
    return `${axiosInstance.defaults.baseURL}/documents/${id}/download`
  },
  
  getViewUrl: (id: string) => {
    return `${axiosInstance.defaults.baseURL}/documents/${id}/view`
  }
}

export const userApi = {
  getCurrentUser: async () => {
    return await axiosInstance.get<User>('/user/me')
  }
}

export const userSettingsApi = {
  get: async () => {
    const response = await axiosInstance.get<User>('/user/settings')
    return response.data
  },

  update: async (settings: Partial<User>) => {
    const response = await axiosInstance.put<User>('/user/settings', settings)
    return response.data
  },

  uploadProfileImage: async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await axiosInstance.post<User>('/user/profile-image', formData, {
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
    const response = await axiosInstance.post<User>('/user/settings/reset')
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
