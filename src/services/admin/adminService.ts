import { apiClient } from '@/config/api';
import type { User, Role, PageResponse } from '@/types/admin';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const adminService = {
  getUsers: async (page = 0, size = 10, status?: string, keyword?: string): Promise<PageResponse<User>> => {
    let url = `${BASE_URL}/admin/users?page=${page}&size=${size}`;
    if (status && status !== 'All Status') {
      url += `&status=${status === 'Active' ? 'true' : 'false'}`;
    }
    if (keyword) {
      url += `&keyword=${encodeURIComponent(keyword)}`;
    }
    return apiClient(url);
  },

  createUser: async (data: any): Promise<User> => {
    return apiClient(`${BASE_URL}/admin/users`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  updateUser: async (id: string, data: any): Promise<User> => {
    return apiClient(`${BASE_URL}/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  getRoles: async (page = 0, size = 10): Promise<PageResponse<Role>> => {
    return apiClient(`${BASE_URL}/admin/roles?page=${page}&size=${size}`);
  },

  createRole: async (data: any): Promise<Role> => {
    return apiClient(`${BASE_URL}/admin/roles`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  updateRole: async (id: string, data: any): Promise<Role> => {
    return apiClient(`${BASE_URL}/admin/roles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  deleteUser: async (id: string): Promise<void> => {
    return apiClient(`${BASE_URL}/admin/users/${id}`, {
      method: 'DELETE'
    });
  },

  getDeletedUsers: async (page = 0, size = 10): Promise<PageResponse<User>> => {
    return apiClient(`${BASE_URL}/admin/users/trash?page=${page}&size=${size}`);
  },

  restoreUser: async (id: string): Promise<void> => {
    return apiClient(`${BASE_URL}/admin/users/${id}/restore`, {
      method: 'PUT'
    });
  },

  permanentlyDeleteUser: async (id: string): Promise<void> => {
    return apiClient(`${BASE_URL}/admin/users/${id}/permanent`, {
      method: 'DELETE'
    });
  }
}