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
  remark?: string;
}

