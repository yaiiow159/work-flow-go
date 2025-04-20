
/**
 * Handles API errors by logging them to the console
 * @param error The error object from axios
 * @param title Optional context for the error
 */
export const handleApiError = (error: any, title = 'Error'): void => {
  let errorMessage = 'An unexpected error occurred'
  
  if (error.response) {
    const { data, status } = error.response
    
    if (typeof data === 'string') {
      errorMessage = data
    } else if (data && typeof data === 'object') {
      if (data.message) {
        errorMessage = data.message
      } else if (data.error) {
        errorMessage = data.error
      } else if (!data.success && data.message) {
        errorMessage = data.message
      } else if (Object.keys(data).length > 0) {
        const fieldErrors = Object.entries(data)
          .map(([field, message]) => `${field}: ${message}`)
          .join('\n')
        
        if (fieldErrors) {
          errorMessage = `Validation errors:\n${fieldErrors}`
        }
      }
    }
    
    errorMessage = `${errorMessage} (Status: ${status})`
  } else if (error.request) {
    errorMessage = 'No response received from server. Please check your connection.'
  } else if (error.message) {
    errorMessage = error.message
  }
  
  console.error(`[${title}]`, errorMessage, error)
}
