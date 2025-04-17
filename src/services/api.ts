import axios from 'axios'
import type { Interview, Document, User } from '../types'

// Base API configuration
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interviews API
export const interviewsApi = {
  // Get all interviews with optional filters
  getAll: async (params?: {
    status?: string
    from?: string
    to?: string
    company?: string
    sort?: string
    order?: 'asc' | 'desc'
  }) => {
    const response = await api.get<Interview[]>('/interviews', { params })
    return response.data
  },

  // Get interview by ID
  getById: async (id: string) => {
    const response = await api.get<Interview>(`/interviews/${id}`)
    return response.data
  },

  // Create a new interview
  create: async (interview: Omit<Interview, 'id' | 'createdAt' | 'updatedAt'>) => {
    const response = await api.post<Interview>('/interviews', interview)
    return response.data
  },

  // Update an existing interview
  update: async (id: string, interview: Partial<Interview>) => {
    const response = await api.put<Interview>(`/interviews/${id}`, interview)
    return response.data
  },

  // Update only the status of an interview
  updateStatus: async (id: string, status: string) => {
    const response = await api.patch<Interview>(`/interviews/${id}/status`, { status })
    return response.data
  },

  // Delete an interview
  delete: async (id: string) => {
    await api.delete(`/interviews/${id}`)
  }
}

// Documents API
export const documentsApi = {
  // Get all documents
  getAll: async () => {
    const response = await api.get<Document[]>('/documents')
    return response.data
  },

  // Upload a document
  upload: async (file: File, name: string, type: string) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('name', name)
    formData.append('type', type)

    const response = await api.post<Document>('/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  },

  // Get document by ID
  getById: async (id: string) => {
    const response = await api.get<Document>(`/documents/${id}`)
    return response.data
  },

  // Delete a document
  delete: async (id: string) => {
    await api.delete(`/documents/${id}`)
  }
}

// User Settings API
export const userSettingsApi = {
  // Get user settings
  get: async () => {
    const response = await api.get<User>('/user/settings')
    return response.data
  },

  // Update user settings
  update: async (settings: Partial<User>) => {
    const response = await api.put<User>('/user/settings', settings)
    return response.data
  },

  // Export user data
  exportData: async () => {
    const response = await api.get('/user/export', {
      responseType: 'blob'
    })
    return response.data
  },

  // Reset user settings to defaults
  resetSettings: async () => {
    const response = await api.post<User>('/user/settings/reset')
    return response.data
  }
}

// Statistics API
export const statisticsApi = {
  // Get interview statistics
  getInterviewStats: async (params?: {
    from?: string
    to?: string
  }) => {
    const response = await api.get('/statistics/interviews', { params })
    return response.data
  }
}

// Error handling interceptor
api.interceptors.response.use(
  response => response,
  error => {
    // Handle API errors here
    console.error('API Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

export default api
