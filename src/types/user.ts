export interface User {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  authProvider: 'google' | 'email' | 'password';
  token: string;
}

export interface UserInfo {

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

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  displayName: string;
}
