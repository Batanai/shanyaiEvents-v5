import { Button, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { router, useLocalSearchParams } from 'expo-router';

export default function ListTickets() {
  const { eId, title } = useLocalSearchParams();

  return (
    <View style={styles.container}>
      <View style={styles.heading}>
        <Text style={styles.headingText}>{title}</Text>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Scan QR Code"
          onPress={() =>
            router.push({
              pathname: '/scan-barcode',
              params: { eId: eId },
            })
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#fff',
  },
  heading: {
    justifyContent: 'center',
    flexDirection: 'row',
    backgroundColor: '#f4511e',
    marginBottom: 10,
    padding: 15,
  },
  headingText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 20,
  },
  buttonContainer: {
    padding: 20,
  },
});
