import { Button, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { router } from 'expo-router';

export default function Main() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Shanyai Events</Text>
      <View style={styles.buttonContainer}>
        <Button onPress={() => router.push('/login')} title="Head to Login" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  buttonContainer: {
    marginTop: 20,
  },
});
