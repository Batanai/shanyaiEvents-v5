import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  ActivityIndicator,
} from 'react-native';
import React from 'react';
import { Shadow } from 'react-native-shadow-2';
import { router } from 'expo-router';
import { useFetchEvents } from '../lib/hooks/useEvents';
import { useAuthStore } from '../lib/store/authStore';

export default function Events() {
  const clearToken = useAuthStore((state) => state.clearToken);
  const { data: events, isLoading, error } = useFetchEvents();

  const handleLogout = () => {
    clearToken();
    router.replace('/login');
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f4511e" />
        <Text style={styles.loadingText}>Loading events...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load events</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={handleLogout}>
          <Text style={styles.retryText}>Logout and try again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.heading}>
        <Text style={{ color: '#fff', fontWeight: '400', fontSize: 16 }}>
          Choose an event
        </Text>

        <TouchableOpacity onPress={handleLogout}>
          <Text style={{ color: '#fff', fontWeight: '400', fontSize: 16 }}>
            Log out
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {events?.map((item, index) => (
          <View
            key={index}
            style={{
              backgroundColor: index % 2 === 0 ? '#eee' : '#fcfcfc',
              padding: 5,
              margin: 5,
            }}>
            <Shadow style={{ width: '100%' }}>
              <View>
                <TouchableWithoutFeedback
                  style={{ height: 10 }}
                  onPress={() =>
                    router.push({
                      pathname: '/list-tickets',
                      params: { eId: parseInt(item.ID), title: item.post_title },
                    })
                  }>
                  <View style={styles.item}>
                    <Text style={styles.itemindex}>{index + 1}</Text>
                    <Text style={styles.itemtext}>{item.post_title}</Text>
                  </View>
                </TouchableWithoutFeedback>
              </View>
            </Shadow>
          </View>
        ))}
      </ScrollView>
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
    justifyContent: 'space-between',
    flexDirection: 'row',
    backgroundColor: '#f4511e',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: 30,
    padding: 15,
  },
  item: {
    flexDirection: 'row',
    paddingVertical: 20,
    marginVertical: 10,
    justifyContent: 'space-evenly',
  },
  itemindex: {
    fontWeight: '600',
    fontSize: 16,
  },
  itemtext: {
    opacity: 0.7,
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#e86c60',
    marginBottom: 20,
  },
  retryBtn: {
    padding: 10,
    backgroundColor: '#f4511e',
    borderRadius: 5,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
  },
});
