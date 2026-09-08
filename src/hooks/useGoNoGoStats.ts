import { useState, useEffect, useCallback } from 'react';
import { statsService } from '@/services/equipment';
import type {
  GoNoGoSummaryDTO,
  DailyTrendDTO,
  DefectBreakdownDTO,
  FloorStatsDTO,
  EquipmentRankDTO,
  StatsFilterState,
} from '@/types/equipment';
import toast from 'react-hot-toast';

// ─── Helper: lấy đầu/cuối tháng hiện tại theo format YYYY-MM-DD ──────────────
function getCurrentMonthRange(): { startDate: string; endDate: string } {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const lastDay = new Date(year, month, 0).getDate();
  const pad = (n: number) => String(n).padStart(2, '0');
  return {
    startDate: `${year}-${pad(month)}-01`,
    endDate: `${year}-${pad(month)}-${pad(lastDay)}`,
  };
}

interface UseGoNoGoStatsReturn {
  // Data
  summary: GoNoGoSummaryDTO | null;
  dailyTrend: DailyTrendDTO[];
  defectBreakdown: DefectBreakdownDTO | null;
  floorStats: FloorStatsDTO[];
  worstEquipments: EquipmentRankDTO[];

  // State
  loading: boolean;
  filter: StatsFilterState;

  // Actions
  setFilter: (filter: Partial<StatsFilterState>) => void;
  refresh: () => void;
}

/**
 * Hook quản lý toàn bộ data + filter cho trang GoNoGo Dashboard.
 * Load tất cả 5 data sources song song bằng Promise.all.
 */
export function useGoNoGoStats(): UseGoNoGoStatsReturn {
  const defaultRange = getCurrentMonthRange();

  const [filter, setFilterState] = useState<StatsFilterState>({
    startDate: defaultRange.startDate,
    endDate: defaultRange.endDate,
    floorId: null,
  });

  const [summary, setSummary] = useState<GoNoGoSummaryDTO | null>(null);
  const [dailyTrend, setDailyTrend] = useState<DailyTrendDTO[]>([]);
  const [defectBreakdown, setDefectBreakdown] = useState<DefectBreakdownDTO | null>(null);
  const [floorStats, setFloorStats] = useState<FloorStatsDTO[]>([]);
  const [worstEquipments, setWorstEquipments] = useState<EquipmentRankDTO[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const { startDate, endDate, floorId } = filter;
      const [sumData, trendData, defectData, floorData, worstData] = await Promise.all([
        statsService.getSummary(startDate, endDate, floorId),
        statsService.getDailyTrend(startDate, endDate, floorId),
        statsService.getDefectBreakdown(startDate, endDate, floorId),
        statsService.getStatsByFloor(startDate, endDate),
        statsService.getWorstEquipments(startDate, endDate, 10),
      ]);
      setSummary(sumData);
      setDailyTrend(trendData);
      setDefectBreakdown(defectData);
      setFloorStats(floorData);
      setWorstEquipments(worstData);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to load statistics');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const setFilter = useCallback((partial: Partial<StatsFilterState>) => {
    setFilterState((prev) => ({ ...prev, ...partial }));
  }, []);

  return {
    summary,
    dailyTrend,
    defectBreakdown,
    floorStats,
    worstEquipments,
    loading,
    filter,
    setFilter,
    refresh: fetchAll,
  };
}
