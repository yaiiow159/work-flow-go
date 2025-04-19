import axios from 'axios'
import { getApiBaseUrl } from '../utils/environment'

const axiosInstance = axios.create({
  baseURL: `${getApiBaseUrl()}/api`,
  headers: {
    'Content-Type': 'application/json'
  }
})

export default axiosInstance
