import { apiClient } from '@/config/api';
import type {
  Floor,
  Equipment,
  TestRecordRequest,
  EquipmentTestRecord,
  EquipmentDailyTest,
  CreateTestAttemptRequest,
  EquipmentTestAttempt,
  DayComparisonDTO
} from '@/types/equipment';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const equipmentService = {
  getAllFloors: async (): Promise<Floor[]> => {
    return apiClient(`${BASE_URL}/equipments/floors`, {
      method: 'GET',
    });
  },

  getEquipmentsByFloor: async (floorId: string): Promise<Equipment[]> => {
    return apiClient(`${BASE_URL}/equipments/floors/${floorId}`, {
      method: 'GET',
    });
  },

  getTestHistory: async (equipmentId: string): Promise<EquipmentTestRecord[]> => {
    return apiClient(`${BASE_URL}/equipments/${equipmentId}/tests`, {
      method: 'GET',
    });
  },

  performTest: async (request: TestRecordRequest): Promise<void> => {
    return apiClient(`${BASE_URL}/equipments/test`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  getDailyTests: async (recordId: string): Promise<EquipmentDailyTest[]> => {
    return apiClient(`${BASE_URL}/equipments/records/${recordId}/daily-tests`, {
      method: 'GET',
    });
  },

  createDailyTest: async (recordId: string): Promise<EquipmentDailyTest> => {
    return apiClient(`${BASE_URL}/equipments/records/${recordId}/daily-tests`, {
      method: 'POST',
    });
  },

  createTestAttempt: async (dailyTestId: string, request: CreateTestAttemptRequest): Promise<EquipmentTestAttempt> => {
    return apiClient(`${BASE_URL}/equipments/daily-tests/${dailyTestId}/attempts`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  compareDays: async (recordId: string, dayIds: string[]): Promise<DayComparisonDTO> => {
    const params = new URLSearchParams();
    dayIds.forEach(id => params.append('dayIds', id));
    return apiClient(`${BASE_URL}/equipments/records/${recordId}/compare-days?${params.toString()}`, {
      method: 'GET',
    });
  }
};
