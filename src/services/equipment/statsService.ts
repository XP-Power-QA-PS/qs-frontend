import { apiClient } from '@/config/api';
import type {
  GoNoGoSummaryDTO,
  DailyTrendDTO,
  DefectBreakdownDTO,
  FloorStatsDTO,
  EquipmentRankDTO,
  EquipmentStatsDTO,
} from '@/types/equipment';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const STATS_BASE = `${BASE_URL}/stats/gonogo`;

// ─── Helper ───────────────────────────────────────────────────────────────────

function buildQuery(params: Record<string, string | number | null | undefined>): string {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([key, val]) => {
    if (val !== null && val !== undefined && val !== '') {
      sp.append(key, String(val));
    }
  });
  const q = sp.toString();
  return q ? `?${q}` : '';
}

// ─── Stats Service ────────────────────────────────────────────────────────────

export const statsService = {

  /**
   * KPI tổng hợp (4 thẻ summary).
   * Nếu không truyền date thì backend mặc định tháng hiện tại.
   */
  getSummary: async (
    startDate?: string,
    endDate?: string,
    floorId?: string | null,
  ): Promise<GoNoGoSummaryDTO> => {
    const q = buildQuery({ startDate, endDate, floorId });
    return apiClient(`${STATS_BASE}/summary${q}`, { method: 'GET' });
  },

  /**
   * Xu hướng từng ngày (Line + Stacked Bar Chart).
   */
  getDailyTrend: async (
    startDate?: string,
    endDate?: string,
    floorId?: string | null,
  ): Promise<DailyTrendDTO[]> => {
    const q = buildQuery({ startDate, endDate, floorId });
    return apiClient(`${STATS_BASE}/trend${q}`, { method: 'GET' });
  },

  /**
   * Phân rã nguyên nhân lỗi Go/NoGo/Program (Donut Chart).
   */
  getDefectBreakdown: async (
    startDate?: string,
    endDate?: string,
    floorId?: string | null,
  ): Promise<DefectBreakdownDTO> => {
    const q = buildQuery({ startDate, endDate, floorId });
    return apiClient(`${STATS_BASE}/defect-breakdown${q}`, { method: 'GET' });
  },

  /**
   * So sánh pass rate giữa các Floor (Horizontal Bar Chart).
   */
  getStatsByFloor: async (
    startDate?: string,
    endDate?: string,
  ): Promise<FloorStatsDTO[]> => {
    const q = buildQuery({ startDate, endDate });
    return apiClient(`${STATS_BASE}/by-floor${q}`, { method: 'GET' });
  },

  /**
   * Top N thiết bị hay lỗi nhất (Table).
   */
  getWorstEquipments: async (
    startDate?: string,
    endDate?: string,
    limit = 10,
  ): Promise<EquipmentRankDTO[]> => {
    const q = buildQuery({ startDate, endDate, limit });
    return apiClient(`${STATS_BASE}/worst-equipments${q}`, { method: 'GET' });
  },

  /**
   * Toàn bộ analytics cho 1 thiết bị.
   * @param month 1–12, default tháng hiện tại
   * @param year  YYYY, default năm hiện tại
   */
  getEquipmentStats: async (
    equipmentId: string,
    month?: number,
    year?: number,
  ): Promise<EquipmentStatsDTO> => {
    const q = buildQuery({ month, year });
    return apiClient(`${STATS_BASE}/equipment/${equipmentId}${q}`, { method: 'GET' });
  },
};
