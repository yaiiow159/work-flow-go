export interface User {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  authProvider: 'google' | 'email' | 'password';
  token: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  displayName: string;
}
