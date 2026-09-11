import { apiClient } from '@/config/api';
import type { RecipientUser, MeetingEmailRequest, EmailSendResult } from '@/types/email';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const emailService = {
  /**
   * Search active internal users for recipient selection
   */
  getRecipients: async (keyword = ''): Promise<RecipientUser[]> => {
    const query = keyword ? `?keyword=${encodeURIComponent(keyword)}` : '';
    return apiClient(`${BASE_URL}/users/emails/recipients${query}`);
  },

  /**
   * Send meeting invitation email to selected recipients
   */
  sendMeetingInvite: async (data: MeetingEmailRequest): Promise<EmailSendResult> => {
    return apiClient(`${BASE_URL}/users/emails/meeting-invite`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Test SMTP server connection with a single test email
   */
  testSmtpConnection: async (toEmail: string): Promise<{ success: boolean; message: string }> => {
    return apiClient(`${BASE_URL}/users/emails/test?toEmail=${encodeURIComponent(toEmail)}`, {
      method: 'POST',
    });
  },
};
