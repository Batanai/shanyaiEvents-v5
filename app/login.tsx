import {
  StyleSheet,
  Text,
  View,
  KeyboardAvoidingView,
  ScrollView,
  TextInput,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import React, { useState } from 'react';
import { useLogin } from '../lib/hooks/useAuth';

export default function Login() {
  const { mutate: login, isPending } = useLogin();
  const [userInput, setUserInput] = useState('');
  const [passInput, setPassInput] = useState('');

  const handleLogin = () => {
    if (userInput && passInput) {
      login({ user: userInput, pass: passInput });
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={10}>
        <ScrollView style={{ height: 90, paddingTop: 80 }}>
          <TextInput
            style={styles.input}
            placeholder="User"
            autoCapitalize="none"
            onChangeText={(user) => setUserInput(user)}
            value={userInput}
            placeholderTextColor="#c9c8c3"
            editable={!isPending}
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            autoCapitalize="none"
            onChangeText={(pass) => setPassInput(pass)}
            value={passInput}
            secureTextEntry
            keyboardType="default"
            placeholderTextColor="#c9c8c3"
            editable={!isPending}
          />

          <TouchableOpacity
            style={[styles.btn, isPending && styles.btnDisabled]}
            onPress={handleLogin}
            disabled={isPending}>
            {isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btn_text}>Log In</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
    backgroundColor: '#c0d6f1',
  },
  input: {
    height: 40,
    width: 250,
    paddingLeft: 10,
    paddingRight: 10,
    borderRadius: 5,
    marginBottom: 15,
    backgroundColor: '#fff',
    color: '#000000',
  },
  btn: {
    height: 40,
    width: 120,
    backgroundColor: '#e86c60',
    borderColor: '#e86c60',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btn_text: {
    color: '#fff',
    fontSize: 16,
    borderRadius: 5,
  },
});
