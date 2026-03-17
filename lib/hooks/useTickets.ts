import { useMutation } from '@tanstack/react-query';
import { ticketsApi, ValidateTicketRequest } from '../api/tickets';
import Toast from 'react-native-toast-message';

export const useValidateTicket = () => {
  return useMutation({
    mutationFn: (ticketData: ValidateTicketRequest) =>
      ticketsApi.validateTicket(ticketData),
    onSuccess: (data) => {
      if (data.status === 'SUCCESS') {
        Toast.show({
          type: 'success',
          text1: 'Ticket Validated',
          text2: 'The ticket is valid!',
          visibilityTime: 4000,
          position: 'top',
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Validation Failed',
          text2: data.msg || 'The ticket could not be validated.',
          visibilityTime: 4000,
          position: 'top',
        });
      }
    },
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to validate the ticket. Please try again.',
        visibilityTime: 4000,
        position: 'top',
      });
    },
  });
};
