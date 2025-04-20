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
  tokenType: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
}

