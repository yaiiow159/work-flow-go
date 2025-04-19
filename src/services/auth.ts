import axiosInstance from './axiosInstance'
import type { AuthResponse } from '../types/user'
import { getApiBaseUrl } from '../utils/environment'

const apiBaseUrl = getApiBaseUrl()

class AuthService {
  async loginWithCredentials(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await axiosInstance.post(`/auth/login`, { email, password })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed')
    }
  }

  async loginWithGoogle(): Promise<void> {
    window.location.href = `${apiBaseUrl}/oauth2/authorization/google`
  }

  async register(email: string, password: string, displayName: string): Promise<AuthResponse> {
    try {
      const response = await axiosInstance.post(`/auth/register`, {
        email,
        password,
        displayName
      })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed')
    }
  }

  async validateToken(): Promise<boolean> {
    try {
      const token = this.getToken()
      if (!token) return false

      const response = await axiosInstance.get(`/auth/validate`)
      return response.status === 200
    } catch (error) {
      return false
    }
  }

  async logout(): Promise<void> {
    try {
      await axiosInstance.post(`/auth/logout`, {})
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  getToken(): string | null {
    const user = localStorage.getItem('user')
    if (user) {
      return JSON.parse(user).token
    }
    return null
  }
}

export default new AuthService()
