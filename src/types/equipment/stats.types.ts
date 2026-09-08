// ─── Stats Types for GONOGO Analytics ────────────────────────────────────────

export interface GoNoGoSummaryDTO {
  totalAttempts: number;
  passCount: number;
  failCount: number;
  passRate: number;
  goFailCount: number;
  noGoFailCount: number;
  programFailCount: number;
  criticalEquipmentCount: number;
  testedEquipmentCount: number;
}

export interface DailyTrendDTO {
  testDate: string; // "YYYY-MM-DD"
  totalAttempts: number;
  passCount: number;
  failCount: number;
  passRate: number;
}

export interface DefectBreakdownDTO {
  goFailCount: number;
  noGoFailCount: number;
  programFailCount: number;
  totalFailCount: number;
  goFailPercent: number;
  noGoFailPercent: number;
  programFailPercent: number;
}

export interface FloorStatsDTO {
  floorId: string;
  floorName: string;
  totalAttempts: number;
  passCount: number;
  failCount: number;
  passRate: number;
  testedEquipmentCount: number;
}

export interface EquipmentRankDTO {
  equipmentId: string;
  equipmentCode: string;
  equipmentName: string;
  floorName: string;
  totalAttempts: number;
  passCount: number;
  failCount: number;
  passRate: number;
  totalDaysWithTest: number;
}

export interface MonthlyStatsDTO {
  month: number;
  year: number;
  label: string; // "09/2026"
  totalAttempts: number;
  passCount: number;
  failCount: number;
  passRate: number;
  totalDays: number;
  avgAttemptsPerDay: number;
}

export interface EquipmentStatsDTO {
  equipmentId: string;
  equipmentCode: string;
  equipmentName: string;
  floorName: string;
  summary: GoNoGoSummaryDTO;
  monthlyTrend: MonthlyStatsDTO[];
  dailyBreakdown: DailyTrendDTO[];
  defectBreakdown: DefectBreakdownDTO;
}

// ─── Filter State ────────────────────────────────────────────────────────────

export interface StatsFilterState {
  startDate: string; // "YYYY-MM-DD"
  endDate: string;   // "YYYY-MM-DD"
  floorId: string | null;
}
