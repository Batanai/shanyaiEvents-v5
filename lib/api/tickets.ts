import { apiClient } from './client';

export interface ValidateTicketRequest {
  token: string;
  qrcode: string;
  eid: string;
}

export interface ValidateTicketResponse {
  status: 'SUCCESS' | 'ERROR';
  msg?: string;
  name_customer?: string;
  seat?: string;
  checkin_time?: string;
  e_cal?: string;
}

export const ticketsApi = {
  validateTicket: async (
    ticketData: ValidateTicketRequest
  ): Promise<ValidateTicketResponse> => {
    const response = await apiClient.post<ValidateTicketResponse>(
      '/wp-json/meup/v1/validate_ticket',
      ticketData
    );
    return response.data;
  },
};
