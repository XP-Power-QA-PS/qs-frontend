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

export interface PageMetadata {
  size: number;
  number: number;
  totalElements: number;
  totalPages: number;
}

export interface PageResponse<T> {
  content: T[];
  page: PageMetadata;
}
