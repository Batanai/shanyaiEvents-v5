import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useCodeScanner,
} from 'react-native-vision-camera';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../lib/store/authStore';
import { Shadow } from 'react-native-shadow-2';
import { useValidateTicket } from '../lib/hooks/useTickets';

export default function ScanBarcode() {
  const { eId } = useLocalSearchParams();
  const [isActive, setIsActive] = useState(false);
  const {
    mutate: validateTicket,
    data: ticketResponse,
    reset,
  } = useValidateTicket();

  const [barcode, setBarcode] = useState('');
  const [showTicketCard, setShowTicketCard] = useState(false);
  const token = useAuthStore((state) => state.token);

  const { hasPermission, requestPermission } = useCameraPermission();

  const camera = useRef<Camera>(null);
  const device = useCameraDevice('back');

  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13'],
    onCodeScanned: (codes) => {
      if (codes && codes[0].value) {
        setBarcode(codes[0].value);
        setShowTicketCard(true);
      }
    },
  });

  useEffect(() => {
    setIsActive(true);

    return () => {
      setIsActive(false);
    };
  }, []);

  useEffect(() => {
    reset();
  }, []);

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission]);

  if (!hasPermission) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Camera device not found</Text>
      </View>
    );
  }

  const confirmBooking = () => {
    if (token && barcode && eId) {
      validateTicket({
        token,
        qrcode: barcode,
        eid: `${eId}`,
      });
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Camera
        ref={camera}
        device={device}
        isActive={isActive}
        codeScanner={codeScanner}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.flashContainer}>
        <Ionicons name={'qr-code-sharp'} size={30} color={'white'} />
      </View>

      {showTicketCard && (
        <View style={styles.motiviewTicket}>
          <Shadow>
            <TouchableOpacity
              style={styles.ticketTouch}
              onPress={() => {
                confirmBooking();
                setShowTicketCard(false);
              }}>
              <View
                style={{
                  flex: 1,
                  marginLeft: 10,
                  justifyContent: 'space-evenly',
                }}>
                <Text style={{ fontSize: 15, color: 'purple', paddingBottom: 5 }}>
                  QR Code Scan Complete
                </Text>
                <Text style={{ fontSize: 12, color: 'black', paddingBottom: 5 }}>
                  QR Code: {barcode}
                </Text>
                <Text style={{ fontSize: 12, color: 'black', paddingBottom: 5 }}>
                  Event ID: {eId}
                </Text>
                <Text style={{ fontSize: 15, color: 'purple' }}>
                  Click to Confirm Booking
                </Text>
              </View>
            </TouchableOpacity>
          </Shadow>
        </View>
      )}

      {ticketResponse && (
        <View style={styles.motiviewBooking}>
          <Shadow>
            <TouchableOpacity
              style={styles.ticketTouch}
              onPress={() => {
                setTimeout(() => {
                  reset();
                  router.push('/events');
                }, 2000);
                setIsActive(false);
              }}>
              <View
                style={{
                  flex: 1,
                  marginLeft: 10,
                  paddingHorizontal: 5,
                  justifyContent: 'space-evenly',
                }}>
                <Text
                  style={{
                    fontSize: 15,
                    color: 'black',
                    fontWeight: 'bold',
                    paddingBottom: 5,
                  }}>
                  Ticket Validation Status
                </Text>
                <Text
                  style={
                    ticketResponse?.status === 'SUCCESS'
                      ? {
                          fontSize: 14,
                          color: 'green',
                          fontWeight: 'bold',
                          paddingBottom: 5,
                        }
                      : {
                          fontSize: 14,
                          color: 'red',
                          fontWeight: 'bold',
                          paddingBottom: 5,
                        }
                  }>
                  Status: {ticketResponse?.status}
                </Text>
                <Text style={{ fontSize: 13, color: 'black', paddingBottom: 5 }}>
                  Message: {ticketResponse?.msg}{' '}
                  {ticketResponse?.msg?.includes('permission') &&
                    '- Logout and Login again'}
                </Text>
                <Text style={{ fontSize: 12, color: 'black', paddingBottom: 5 }}>
                  Name: {ticketResponse?.name_customer}
                </Text>
                <Text style={{ fontSize: 12, color: 'black', paddingBottom: 5 }}>
                  Seat: {ticketResponse?.seat}
                </Text>
                <Text style={{ fontSize: 12, color: 'black', paddingBottom: 5 }}>
                  CheckedIn Time: {ticketResponse?.checkin_time}
                </Text>
                <Text style={{ fontSize: 12, color: 'black', paddingBottom: 5 }}>
                  Event details: {ticketResponse?.e_cal}
                </Text>
                <Text
                  style={
                    ticketResponse?.status === 'SUCCESS'
                      ? { fontSize: 14, color: 'green', fontWeight: 'bold' }
                      : { fontSize: 14, color: 'red', fontWeight: 'bold' }
                  }>
                  Click to Dismiss
                </Text>
              </View>
            </TouchableOpacity>
          </Shadow>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flashContainer: {
    position: 'absolute',
    left: 10,
    top: 30,
    padding: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.40)',
    gap: 30,
  },
  motiviewTicket: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 160,
    paddingVertical: 20,
    alignItems: 'center',
    zIndex: 1,
  },
  motiviewBooking: {
    position: 'absolute',
    top: 300,
    left: 0,
    right: 0,
    height: 250,
    paddingVertical: 20,
    alignItems: 'center',
    zIndex: 1,
  },
  ticketTouch: {
    flex: 1,
    flexDirection: 'row',
    width: '80%',
    alignItems: 'center',
    paddingHorizontal: 5,
    borderRadius: 10,
    backgroundColor: '#fff',
  },
});
