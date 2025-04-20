import axios from 'axios'
import { getApiBaseUrl } from '../utils/environment'
import { handleApiError } from '../utils/errorHandler'

const axiosInstance = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json'
  }
})

axiosInstance.interceptors.request.use(
  config => {
    let token = localStorage.getItem('token')
    
    if (!token) {
      const userStr = localStorage.getItem('user')
      if (userStr) {
        try {
          const user = JSON.parse(userStr)
          token = user.token
        } catch (e) {
          console.error('Error parsing user from localStorage:', e)
        }
      }
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

axiosInstance.interceptors.response.use(
  response => response,
  error => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      localStorage.removeItem('user')
      localStorage.removeItem('token')
      window.location.href = '/login'
    } else {
      handleApiError(error)
    }
    
    return Promise.reject(error)
  }
)

export default axiosInstance
