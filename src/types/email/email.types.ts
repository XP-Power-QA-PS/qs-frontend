export interface EmailRecipient {
  userId?: number | null;
  name?: string;
  email: string;
  department?: string;
  recipientType: 'TO' | 'CC';
}

export interface RecipientUser {
  id: number;
  username: string;
  email: string;
  fullName: string;
  roles: string[];
  department: string;
}

export interface MeetingEmailRequest {
  trackingNo: string;
  model?: string;
  customerName?: string;
  issueDescription?: string;
  meetingDate: string; // YYYY-MM-DD
  startTime: string;   // HH:mm
  endTime?: string;    // HH:mm
  roomLocation: string;
  agenda: string;
  organizerName?: string;
  organizerEmail?: string;
  isCustomerInitiated?: boolean;
  recipients: EmailRecipient[];
}

export interface EmailSendResult {
  trackingNo: string;
  totalRecipients: number;
  toCount: number;
  ccCount: number;
  message: string;
  async: boolean;
  timestamp: string;
}
