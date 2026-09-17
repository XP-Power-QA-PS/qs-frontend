export interface User {
  id: string;
  username: string;
  email?: string | null;
  roles: string[];
  enabled: boolean;
  fullName?: string;
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

export interface PermissionItem {
  id: string;
  code: string;
  module: string;
  action: string;
  name: string;
  description?: string;
}

export interface PermissionModuleGroup {
  moduleKey: string;
  moduleName: string;
  description: string;
  permissions: PermissionItem[];
}

export interface PermissionMatrixData {
  modules: PermissionModuleGroup[];
  roles: Role[];
  rolePermissions: Record<string, string[]>;
}

export interface UpdatePermissionMatrixPayload {
  rolePermissions: Record<string, string[]>;
}
