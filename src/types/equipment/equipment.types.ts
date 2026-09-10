export interface Floor {
  id: string;
  name: string;
  description?: string;
}

export interface Equipment {
  id: string;
  equipmentCode: string;
  equipmentName: string;
  floorId: string;
}

export interface TestRecordRequest {
  equipmentId: string;
}

export interface EquipmentTestRecord {
  id: string;
  testMonth: number;
  testYear: number;
  testedAt: string;
}

export type TestStatus = 'PASS' | 'FAIL';

export interface EquipmentTestAttempt {
  id: string;
  attemptTime: string;
  programStatus: TestStatus;
  goStatus: TestStatus;
  noGoStatus: TestStatus;
  resultStatus: TestStatus;
  machineVerified?: boolean;
  remark?: string;
  testerUsername: string;
}

export interface EquipmentDailyTest {
  id: string;
  recordId: string;
  testDate: string;
  attempts: EquipmentTestAttempt[];
}

export interface CreateTestAttemptRequest {
  programStatus: TestStatus;
  goStatus: TestStatus;
  noGoStatus: TestStatus;
  confirmedMachineCheck: boolean;
  remark?: string;
}


export interface DailySummaryDTO {
  dailyTestId: string;
  testDate: string;
  totalAttempts: number;
  passCount: number;
  failCount: number;
  passRate: number;
  overallStatus: string;
  latestTester: string;
  attempts: EquipmentTestAttempt[];
}

export interface ComparisonInsightDTO {
  sameTester: boolean;
  allTesters: string[];
  passRateDifference: number;
  parameterDifferences: string[];
  summaryText: string;
}

export interface DayComparisonDTO {
  days: DailySummaryDTO[];
  insights: ComparisonInsightDTO;
}

