export interface User {
  id: string;
  username: string;
  email: string;
  roles: string[];
  enabled: boolean;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  avatarUrl?: string;
  createdAt?: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
}

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
}
