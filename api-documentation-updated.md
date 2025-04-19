# Work-Flow-Go API Documentation

This document provides a comprehensive overview of all API endpoints and data models used in the Work-Flow-Go application.

## Base URL

- Development: `http://localhost:8081/api`
- Production: `https://work-flow-go-server.onrender.com/api`

## Authentication

All API requests (except for login and register) require authentication using a JWT token. The token should be included in the Authorization header:

```
Authorization: Bearer {token}
```

## Data Models

### User

```typescript
interface User {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  authProvider: 'google' | 'email' | 'password';
  token: string;
}
```

### Authentication Response

```typescript
interface AuthResponse {
  user: User;
  token: string;
}
```

### Login Credentials

```typescript
interface LoginCredentials {
  email: string;
  password: string;
}
```

### Register Data

```typescript
interface RegisterData extends LoginCredentials {
  displayName: string;
}
```

### Interview

```typescript
type InterviewStatus = 'scheduled' | 'confirmed' | 'completed' | 'rejected' | 'cancelled';
type InterviewType = 'remote' | 'onsite' | 'phone';

interface Interview {
  id: string;
  companyName: string;
  position: string;
  date: string;
  time: string;
  type: InterviewType;
  status: InterviewStatus;
  location: string;
  notes: string;
  contactPerson: ContactPerson;
  questions: Question[];
  documents: Document[];
  rating: number;
  feedback: string;
  createdAt: string;
  updatedAt: string;
}
```

### Contact Person

```typescript
interface ContactPerson {
  name: string;
  position: string;
  email: string;
  phone: string;
}
```

### Question

```typescript
type QuestionCategory = 'technical' | 'behavioral' | 'company' | 'role' | 'other';

interface Question {
  id: string;
  question: string;
  answer: string;
  category: QuestionCategory;
  isImportant: boolean;
}
```

### Document

```typescript
type DocumentType = 'resume' | 'cover_letter' | 'portfolio' | 'other';

interface Document {
  id: string;
  name: string;
  type: DocumentType;
  url: string;
  contentType?: string;
  size?: number;
  createdAt?: string;
}
```

### Reminder

```typescript
interface Reminder {
  id: string;
  interviewId: string;
  time: string;
  message: string;
  isCompleted: boolean;
}
```

### Interview Statistics

```typescript
interface InterviewStatistics {
  totalInterviews: number;
  upcomingInterviews: number;
  completedInterviews: number;
  rejectedInterviews: number;
  byStatus: Record<InterviewStatus, number>;
  byCompany: Array<{
    company: string;
    count: number;
  }>;
  byMonth: Array<{
    month: string;
    count: number;
  }>;
}
```

## API Endpoints

### Authentication

#### Register New User

- **URL**: `/auth/register`
- **Method**: `POST`
- **Description**: Register a new user with email, password, and display name
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "securePassword123",
    "displayName": "User Name"
  }
  ```
- **Response**: AuthResponse object with user data and JWT token
  ```json
  {
    "user": {
      "id": "user123",
      "email": "user@example.com",
      "displayName": "User Name",
      "photoURL": null,
      "authProvider": "password",
      "token": "jwt_token_string"
    },
    "token": "jwt_token_string"
  }
  ```
- **Frontend Implementation**: `authService.register(email, password, displayName)`

#### Login with Email and Password

- **URL**: `/auth/login`
- **Method**: `POST`
- **Description**: Authenticate user with email and password
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "securePassword123"
  }
  ```
- **Response**: AuthResponse object with user data and JWT token
- **Frontend Implementation**: `authService.loginWithCredentials(email, password)`

#### Google OAuth Login

- **URL**: `/auth/google`
- **Method**: `GET`
- **Description**: Redirect to Google OAuth login page
- **Response**: Redirects to Google authentication
- **Frontend Implementation**: `authService.loginWithGoogle()`

#### Google OAuth Callback

- **URL**: `/auth/google/callback`
- **Method**: `GET`
- **Description**: Handle Google OAuth callback
- **Query Parameters**: `code=[string]` - Authorization code from Google
- **Response**: AuthResponse object with user data and JWT token
- **Frontend Implementation**: `authService.handleGoogleCallback(code)`

#### Validate Token

- **URL**: `/auth/validate`
- **Method**: `GET`
- **Description**: Validate JWT token
- **Headers**: `Authorization: Bearer {token}`
- **Response**: Status 200 if token is valid
- **Frontend Implementation**: `authService.validateToken()`

#### Logout

- **URL**: `/auth/logout`
- **Method**: `POST`
- **Description**: Invalidate user token
- **Headers**: `Authorization: Bearer {token}`
- **Response**: Status 200
- **Frontend Implementation**: `authService.logout()`

### Interviews

#### Get All Interviews

- **URL**: `/interviews`
- **Method**: `GET`
- **Description**: Retrieve all interviews for the authenticated user
- **Headers**: `Authorization: Bearer {token}`
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
- **Headers**: `Authorization: Bearer {token}`
- **URL Parameters**: `id=[string]` - ID of the interview
- **Response**: Interview object
- **Frontend Implementation**: `interviewsApi.getById(id)`

#### Create Interview

- **URL**: `/interviews`
- **Method**: `POST`
- **Description**: Create a new interview
- **Headers**: `Authorization: Bearer {token}`
- **Request Body**: Interview object (without id, createdAt, updatedAt)
- **Response**: Created interview object with id, createdAt, updatedAt
- **Frontend Implementation**: `interviewsApi.create(interview)`

#### Update Interview

- **URL**: `/interviews/{id}`
- **Method**: `PUT`
- **Description**: Update an existing interview
- **Headers**: `Authorization: Bearer {token}`
- **URL Parameters**: `id=[string]` - ID of the interview to update
- **Request Body**: Interview object (partial updates allowed)
- **Response**: Updated interview object
- **Frontend Implementation**: `interviewsApi.update(id, interview)`

#### Update Interview Status

- **URL**: `/interviews/{id}/status`
- **Method**: `PATCH`
- **Description**: Update only the status of an interview
- **Headers**: `Authorization: Bearer {token}`
- **URL Parameters**: `id=[string]` - ID of the interview
- **Request Body**: 
  ```json
  {
    "status": "scheduled | confirmed | completed | rejected | cancelled"
  }
  ```
- **Response**: Updated interview object
- **Frontend Implementation**: `interviewsApi.updateStatus(id, status)`

#### Delete Interview

- **URL**: `/interviews/{id}`
- **Method**: `DELETE`
- **Description**: Delete an interview
- **Headers**: `Authorization: Bearer {token}`
- **URL Parameters**: `id=[string]` - ID of the interview to delete
- **Response**: Status 204 (No Content)
- **Frontend Implementation**: `interviewsApi.delete(id)`

### Documents

#### Get All Documents

- **URL**: `/documents`
- **Method**: `GET`
- **Description**: Retrieve all documents for the authenticated user
- **Headers**: `Authorization: Bearer {token}`
- **Response**: Array of Document objects
- **Frontend Implementation**: `documentsApi.getAll()`

#### Upload Document

- **URL**: `/documents`
- **Method**: `POST`
- **Description**: Upload a new document
- **Headers**: `Authorization: Bearer {token}`
- **Request Body**: Multipart form data with:
  - `file` - The document file
  - `name` - Document name
  - `type` - Document type (resume, cover_letter, portfolio, other)
- **Response**: Created document object with id and url
- **Frontend Implementation**: `documentsApi.upload(file, name, type)`

#### Get Document

- **URL**: `/documents/{id}`
- **Method**: `GET`
- **Description**: Get document metadata by ID
- **Headers**: `Authorization: Bearer {token}`
- **URL Parameters**: `id=[string]` - ID of the document
- **Response**: Document object
- **Frontend Implementation**: `documentsApi.getById(id)`

#### Update Document

- **URL**: `/documents/{id}`
- **Method**: `PUT`
- **Description**: Update document metadata
- **Headers**: `Authorization: Bearer {token}`
- **URL Parameters**: `id=[string]` - ID of the document
- **Request Body**: Partial Document object
- **Response**: Updated Document object
- **Frontend Implementation**: `documentsApi.update(id, document)`

#### Delete Document

- **URL**: `/documents/{id}`
- **Method**: `DELETE`
- **Description**: Delete a document
- **Headers**: `Authorization: Bearer {token}`
- **URL Parameters**: `id=[string]` - ID of the document to delete
- **Response**: Status 204 (No Content)
- **Frontend Implementation**: `documentsApi.delete(id)`

#### Download Document

- **URL**: `/documents/{id}/download`
- **Method**: `GET`
- **Description**: Download a document
- **Headers**: `Authorization: Bearer {token}`
- **URL Parameters**: `id=[string]` - ID of the document
- **Response**: File download
- **Frontend Implementation**: `documentsApi.getDownloadUrl(id)`

#### View Document

- **URL**: `/documents/{id}/view`
- **Method**: `GET`
- **Description**: View a document in browser
- **Headers**: `Authorization: Bearer {token}`
- **URL Parameters**: `id=[string]` - ID of the document
- **Response**: File for viewing
- **Frontend Implementation**: `documentsApi.getViewUrl(id)`

### User Settings

#### Get User Settings

- **URL**: `/user/settings`
- **Method**: `GET`
- **Description**: Retrieve the current user's settings
- **Headers**: `Authorization: Bearer {token}`
- **Response**: User object
- **Frontend Implementation**: `userSettingsApi.get()`

#### Update User Settings

- **URL**: `/user/settings`
- **Method**: `PUT`
- **Description**: Update the current user's settings
- **Headers**: `Authorization: Bearer {token}`
- **Request Body**: Partial User object
- **Response**: Updated User object
- **Frontend Implementation**: `userSettingsApi.update(settings)`

#### Upload Profile Image

- **URL**: `/user/profile-image`
- **Method**: `POST`
- **Description**: Upload a profile image for the current user
- **Headers**: `Authorization: Bearer {token}`
- **Request Body**: Multipart form data with:
  - `file` - The image file
- **Response**: Updated User object with photoURL
- **Frontend Implementation**: `userSettingsApi.uploadProfileImage(file)`

#### Export User Data

- **URL**: `/user/export`
- **Method**: `GET`
- **Description**: Export all user data
- **Headers**: `Authorization: Bearer {token}`
- **Response**: Blob (file download)
- **Frontend Implementation**: `userSettingsApi.exportData()`

#### Reset User Settings

- **URL**: `/user/settings/reset`
- **Method**: `POST`
- **Description**: Reset user settings to defaults
- **Headers**: `Authorization: Bearer {token}`
- **Response**: Updated User object
- **Frontend Implementation**: `userSettingsApi.resetSettings()`

### Statistics

#### Get Interview Statistics

- **URL**: `/statistics/interviews`
- **Method**: `GET`
- **Description**: Get statistics about interviews
- **Headers**: `Authorization: Bearer {token}`
- **Query Parameters**:
  - `from?: string` - Start date for statistics (optional)
  - `to?: string` - End date for statistics (optional)
- **Response**: Interview statistics data
- **Frontend Implementation**: `statisticsApi.getInterviewStats(params)`

## Error Handling

All API endpoints return appropriate HTTP status codes:

- `200 OK`: Request succeeded
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request parameters
- `401 Unauthorized`: Authentication required or failed
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

Error responses include a message field explaining the error:

```json
{
  "message": "Error message description"
}
```
