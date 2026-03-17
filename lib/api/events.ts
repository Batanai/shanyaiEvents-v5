import { apiClient } from './client';

export interface Event {
  ID: string;
  post_title: string;
}

export interface EventsRequest {
  token: string;
}

export interface EventsResponse {
  status: 'SUCCESS' | 'ERROR';
  msg?: string;
  events?: Event[];
}

export const eventsApi = {
  fetchEvents: async (token: string): Promise<EventsResponse> => {
    const response = await apiClient.post<EventsResponse>(
      '/wp-json/meup/v1/event_accepted',
      { token }
    );
    return response.data;
  },
};
