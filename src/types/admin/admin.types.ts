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

export interface FloorItem {
  id: string;
  name: string;
  description?: string;
  equipmentCount: number;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface CreateFloorRequest {
  name: string;
  description?: string;
}

export interface UpdateFloorRequest {
  name: string;
  description?: string;
}
