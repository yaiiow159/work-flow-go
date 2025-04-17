# WorkFlowGo API Documentation

This document outlines the API endpoints required for the WorkFlowGo interview tracking system. The backend is implemented using a RESTful API architecture.

## Base URL

All API endpoints are relative to: `/api`

## Authentication

Authentication will be implemented in a future phase. Currently, the API is designed for personal use without authentication.

## Data Models

### Interview

```typescript
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
```

## API Endpoints

### Interviews

#### Get All Interviews

- **URL**: `/interviews`
- **Method**: `GET`
- **Description**: Retrieve all interviews
- **Query Parameters**:
  - `status?: string` - Filter by status (optional)
  - `from?: string` - Filter by date range start (optional)
  - `to?: string` - Filter by date range end (optional)
  - `company?: string` - Filter by company name (optional)
  - `sort?: string` - Sort field (default: date)
  - `order?: 'asc' | 'desc'` - Sort order (default: asc)
- **Response**: Array of Interview objects
- **Frontend Implementation**: `interviewsApi.getAll(params)`

#### Get Interview by ID

- **URL**: `/interviews/{id}`
- **Method**: `GET`
- **Description**: Retrieve a specific interview by ID
- **URL Parameters**: `id=[string]` - ID of the interview
- **Response**: Interview object
- **Error Responses**:
  - `404 Not Found` - If interview with the specified ID does not exist
- **Frontend Implementation**: `interviewsApi.getById(id)`

#### Create Interview

- **URL**: `/interviews`
- **Method**: `POST`
- **Description**: Create a new interview
- **Request Body**: Interview object (without id, createdAt, and updatedAt)
- **Response**: Created interview object with id, createdAt, and updatedAt
- **Error Responses**:
  - `400 Bad Request` - If required fields are missing or invalid
- **Frontend Implementation**: `interviewsApi.create(interview)`

#### Update Interview

- **URL**: `/interviews/{id}`
- **Method**: `PUT`
- **Description**: Update an existing interview
- **URL Parameters**: `id=[string]` - ID of the interview to update
- **Request Body**: Interview object (partial updates allowed)
- **Response**: Updated interview object
- **Error Responses**:
  - `404 Not Found` - If interview with the specified ID does not exist
  - `400 Bad Request` - If required fields are missing or invalid
- **Frontend Implementation**: `interviewsApi.update(id, interview)`

#### Update Interview Status

- **URL**: `/interviews/{id}/status`
- **Method**: `PATCH`
- **Description**: Update only the status of an interview
- **URL Parameters**: `id=[string]` - ID of the interview
- **Request Body**: 
  ```json
  {
    "status": "scheduled | confirmed | completed | rejected | cancelled"
  }
  ```
- **Response**: Updated interview object
- **Error Responses**:
  - `404 Not Found` - If interview with the specified ID does not exist
  - `400 Bad Request` - If status is invalid
- **Frontend Implementation**: `interviewsApi.updateStatus(id, status)`

#### Delete Interview

- **URL**: `/interviews/{id}`
- **Method**: `DELETE`
- **Description**: Delete an interview
- **URL Parameters**: `id=[string]` - ID of the interview to delete
- **Response**: Status 204 (No Content)
- **Error Responses**:
  - `404 Not Found` - If interview with the specified ID does not exist
- **Frontend Implementation**: `interviewsApi.delete(id)`

### Documents

#### Get All Documents

- **URL**: `/documents`
- **Method**: `GET`
- **Description**: Retrieve all documents
- **Response**: Array of Document objects
- **Frontend Implementation**: `documentsApi.getAll()`

#### Upload Document

- **URL**: `/documents`
- **Method**: `POST`
- **Description**: Upload a new document
- **Request Body**: Multipart form data with:
  - `file` - The document file
  - `name` - Document name
  - `type` - Document type (resume, cover_letter, portfolio, other)
- **Response**: Created document object with id and url
- **Error Responses**:
  - `400 Bad Request` - If required fields are missing or invalid
  - `413 Payload Too Large` - If file size exceeds the limit
- **Frontend Implementation**: `documentsApi.upload(file, name, type)`

#### Get Document

- **URL**: `/documents/{id}`
- **Method**: `GET`
- **Description**: Get document metadata by ID
- **URL Parameters**: `id=[string]` - ID of the document
- **Response**: Document object
- **Error Responses**:
  - `404 Not Found` - If document with the specified ID does not exist
- **Frontend Implementation**: `documentsApi.getById(id)`

#### Delete Document

- **URL**: `/documents/{id}`
- **Method**: `DELETE`
- **Description**: Delete a document
- **URL Parameters**: `id=[string]` - ID of the document to delete
- **Response**: Status 204 (No Content)
- **Error Responses**:
  - `404 Not Found` - If document with the specified ID does not exist
- **Frontend Implementation**: `documentsApi.delete(id)`

### User Settings

#### Get User Settings

- **URL**: `/user/settings`
- **Method**: `GET`
- **Description**: Get user settings
- **Response**: User object
- **Error Responses**:
  - `404 Not Found` - If user settings do not exist
- **Frontend Implementation**: `userSettingsApi.get()`

#### Update User Settings

- **URL**: `/user/settings`
- **Method**: `PUT`
- **Description**: Update user settings
- **Request Body**: User object (partial updates allowed)
- **Response**: Updated User object
- **Error Responses**:
  - `400 Bad Request` - If required fields are missing or invalid
- **Frontend Implementation**: `userSettingsApi.update(settings)`

#### Reset User Settings

- **URL**: `/user/settings/reset`
- **Method**: `POST`
- **Description**: Reset user settings to defaults
- **Response**: Default User object
- **Error Responses**:
  - `500 Internal Server Error` - If reset fails
- **Frontend Implementation**: `userSettingsApi.resetSettings()`

#### Export User Data

- **URL**: `/user/export`
- **Method**: `GET`
- **Description**: Export all user data (interviews, documents, settings)
- **Response**: JSON file containing all user data
- **Error Responses**:
  - `500 Internal Server Error` - If export fails
- **Frontend Implementation**: `userSettingsApi.exportData()`

### Statistics

#### Get Interview Statistics

- **URL**: `/statistics/interviews`
- **Method**: `GET`
- **Description**: Get interview statistics
- **Query Parameters**:
  - `from?: string` - Filter by date range start (optional)
  - `to?: string` - Filter by date range end (optional)
- **Response**: 
  ```json
  {
    "totalInterviews": 10,
    "byStatus": {
      "scheduled": 3,
      "confirmed": 2,
      "completed": 3,
      "rejected": 1,
      "cancelled": 1
    },
    "byCompany": [
      {
        "companyName": "Company A",
        "count": 3
      },
      {
        "companyName": "Company B",
        "count": 2
      }
    ],
    "byMonth": [
      {
        "month": "2023-01",
        "count": 5
      },
      {
        "month": "2023-02",
        "count": 5
      }
    ]
  }
  ```
- **Frontend Implementation**: `statisticsApi.getInterviewStats(params)`

## Error Handling

All API endpoints return standard HTTP status codes:

- `200 OK` - The request was successful
- `201 Created` - The resource was successfully created
- `204 No Content` - The request was successful but there is no representation to return
- `400 Bad Request` - The request could not be understood or was missing required parameters
- `404 Not Found` - Resource was not found
- `500 Internal Server Error` - Server error

Error responses will include a JSON object with an error message:

```json
{
  "error": "Error message"
}
```

## Frontend API Service Implementation

The frontend uses a centralized API service with Axios for all API calls. The service is implemented in `src/services/api.ts` and includes:

- Base API configuration with interceptors for error handling
- Separate API modules for different resources (interviews, documents, user settings, statistics)
- Type-safe request and response handling using TypeScript interfaces
- Consistent error handling across all API calls

Example of API service usage in a Vue component:

```typescript
import { interviewsApi } from '../services/api'
import type { Interview } from '../types'

// In a Vue component
const fetchInterviews = async () => {
  try {
    const interviews = await interviewsApi.getAll()
    // Process interviews data
  } catch (error) {
    // Handle error
    console.error('Failed to fetch interviews:', error)
  }
}
```

This API documentation reflects the current frontend architecture and provides a clear reference for both frontend and backend developers.
