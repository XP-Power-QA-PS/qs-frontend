export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

export interface UserProfile {
  id: number;
  fullName?: string;
  email: string;
  phoneNumber?: string;
  avatarUrl?: string;
  dateOfBirth?: string;
  gender?: string;
  bio?: string;
}
