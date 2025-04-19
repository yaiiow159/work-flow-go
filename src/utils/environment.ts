const DEV_API_URL = 'http://localhost:8081'
const PROD_API_URL = 'https://work-flow-go-server.onrender.com'

export const getApiBaseUrl = (): string => {
  return import.meta.env.MODE === 'production' ? PROD_API_URL : DEV_API_URL
}

export const getGoogleClientId = (): string => {
  return import.meta.env.MODE === 'production'
    ? import.meta.env.VITE_GOOGLE_CLIENT_ID_PROD
    : import.meta.env.VITE_GOOGLE_CLIENT_ID_DEV
}

export const isDevelopment = (): boolean => {
  return import.meta.env.MODE === 'development'
}

export const isProduction = (): boolean => {
  return import.meta.env.MODE === 'production'
}
