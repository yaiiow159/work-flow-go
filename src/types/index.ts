export type InterviewStatus = 'scheduled' | 'confirmed' | 'completed' | 'rejected' | 'cancelled'
export type InterviewType = 'remote' | 'onsite' | 'phone'
export type QuestionCategory = 'technical' | 'behavioral' | 'company' | 'role' | 'other'
export type DocumentType = 'resume' | 'cover_letter' | 'portfolio' | 'other'

export interface ContactPerson {
  name: string
  position: string
  email: string
  phone: string
}

export interface Question {
  id: string
  question: string
  answer: string
  category: QuestionCategory
  isImportant: boolean
}

export interface Document {
  id: string
  name: string
  type: DocumentType
  url: string
  contentType?: string
  size?: number
  createdAt?: string
}

export interface Interview {
  id: string
  companyName: string
  position: string
  date: string
  time: string
  type: InterviewType
  status: InterviewStatus
  location: string
  notes: string
  contactPerson: ContactPerson
  questions: Question[]
  documents: Document[]
  rating: number
  feedback: string
  createdAt: string
  updatedAt: string
}

export interface User {
  id: string
  name: string
  email: string
  preferences: {
    theme: {
      darkMode: boolean
      primaryColor: string
    }
    notifications: {
      enabled: boolean
      emailNotifications: boolean
      reminderTime: string
    }
    display: {
      defaultView: 'calendar' | 'list'
      compactMode: boolean
    }
  }
}

export interface Reminder {
  id: string
  interviewId: string
  time: string
  message: string
  isCompleted: boolean
}

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  isRead: boolean
  createdAt: string
  relatedEntityId?: string
  relatedEntityType?: 'interview' | 'document' | 'system'
}

export interface UserInfo {
  id: string
  name: string
  email: string
  bio: string
  phone: string
  location: string
  company: string
  position: string
  photoURL?: string
  preferences?: {
    theme: {
      darkMode: boolean
      primaryColor: string
    }
    notifications: {
      enabled: boolean
      emailNotifications: boolean
      reminderTime: string
    }
    display: {
      defaultView: 'calendar' | 'list'
      compactMode: boolean
    }
  }
}

export interface UserPreferencesDTO {
  theme: {
    darkMode: boolean
    primaryColor: string
  }
  notifications: {
    enabled: boolean
    emailNotifications: boolean
    reminderTime: string
  }
  display: {
    defaultView: 'calendar' | 'list'
    compactMode: boolean
  }
}

export interface UserSettingsDTO {
  id: number
  name: string
  email: string
  photoURL: string
  emailVerified: boolean
  preferences: UserPreferencesDTO
}

export interface UserSettingsRequest {
  name?: string
  email?: string
  preferences?: {
    theme?: {
      darkMode?: boolean
      primaryColor?: string
    }
    notifications?: {
      enabled?: boolean
      emailNotifications?: boolean
      reminderTime?: string
    }
    display?: {
      defaultView?: 'calendar' | 'list'
      compactMode?: boolean
    }
  }
}

export interface PasswordChangeRequest {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}
