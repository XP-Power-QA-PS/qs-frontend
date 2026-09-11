import { apiClient } from '@/config/api';
import { AUTH_CONSTANTS } from '@/constants/app.constants';
import type {
  ComplaintCreateRequest,
  ComplaintDetail,
  ComplaintMeeting,
  ComplaintScheduleMeetingRequest,
  ComplaintSummary,
  ComplaintUpdateRequest,
  MeetingConcludeRequest,
  PageResponse,
} from '@/types/complaint/complaint.types';
import type { EmailSendResult } from '@/types/email';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const complaintService = {
  /**
   * Create new complaint (Phase 1 Intake)
   */
  createComplaint: async (data: ComplaintCreateRequest): Promise<ComplaintDetail> => {
    return apiClient(`${BASE_URL}/complaints`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Get paginated list of complaints with annual, monthly, and status filters
   */
  getComplaints: async (params?: {
    year?: number;
    month?: string;
    status?: string;
    page?: number;
    size?: number;
  }): Promise<PageResponse<ComplaintSummary>> => {
    const query = new URLSearchParams();
    if (params?.year) query.append('year', params.year.toString());
    if (params?.month) query.append('month', params.month);
    if (params?.status) query.append('status', params.status);
    if (params?.page !== undefined) query.append('page', params.page.toString());
    if (params?.size !== undefined) query.append('size', params.size.toString());

    const qs = query.toString() ? `?${query.toString()}` : '';
    return apiClient(`${BASE_URL}/complaints${qs}`);
  },

  /**
   * Get single complaint detail by ID
   */
  getComplaintById: async (id: number | string): Promise<ComplaintDetail> => {
    return apiClient(`${BASE_URL}/complaints/${id}`);
  },

  /**
   * Get single complaint detail by tracking number (e.g. 2026-09-0001)
   */
  getComplaintByTrackingNo: async (trackingNo: string): Promise<ComplaintDetail> => {
    return apiClient(`${BASE_URL}/complaints/tracking/${encodeURIComponent(trackingNo)}`);
  },

  /**
   * Get distinct list of years that have complaints
   */
  getAvailableYears: async (): Promise<number[]> => {
    return apiClient(`${BASE_URL}/complaints/years`);
  },

  /**
   * Schedule preliminary review meeting for a complaint and dispatch emails
   */
  scheduleMeeting: async (
    complaintId: number | string,
    data: ComplaintScheduleMeetingRequest
  ): Promise<EmailSendResult> => {
    return apiClient(`${BASE_URL}/complaints/${complaintId}/schedule-meeting`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update complaint progress or fields across any of the 7 phases
   */
  updateComplaint: async (
    identifier: number | string,
    data: ComplaintUpdateRequest
  ): Promise<ComplaintDetail> => {
    return apiClient(`${BASE_URL}/complaints/${identifier}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Conclude a meeting: mark completed, save minutes, conclusion, and agreed containment
   */
  concludeMeeting: async (
    meetingId: number | string,
    data: MeetingConcludeRequest
  ): Promise<ComplaintMeeting> => {
    return apiClient(`${BASE_URL}/complaints/meetings/${meetingId}/conclude`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Conclude a meeting for a specific complaint and return updated complaint detail
   */
  concludeMeetingForComplaint: async (
    identifier: number | string,
    meetingId: number | string,
    data: MeetingConcludeRequest
  ): Promise<ComplaintDetail> => {
    return apiClient(`${BASE_URL}/complaints/${identifier}/meetings/${meetingId}/conclude`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Export complaints to Excel (.xlsx) using Customer complaint template
   */
  exportComplaintsExcel: async (year?: number): Promise<void> => {
    const token = localStorage.getItem(AUTH_CONSTANTS.ACCESS_TOKEN_KEY);
    const qs = year ? `?year=${year}` : '';
    const response = await fetch(`${BASE_URL}/complaints/export${qs}`, {
      method: 'GET',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!response.ok) {
      let msg = 'Failed to export Excel file';
      try {
        const err = await response.json();
        msg = err.message || msg;
      } catch (_) {}
      throw new Error(msg);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Customer_complaint_template_${year || 'all'}.xlsx`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },
};
