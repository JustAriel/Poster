import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { findUserByUsername, initializeDatabase } from '../db/users';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

const Login = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSignupPress = () => {
    navigation.navigate('Signup');
  };

  const handleLoginPress = async () => {
    try {
      await initializeDatabase();

      const userResult = await findUserByUsername(username);

      if (userResult.rows.length === 0) {
        Alert.alert('Error', 'User not found');
        return;
      }

      const storedPassword = userResult.rows.item(0).password;

      if (password === storedPassword) {
        await AsyncStorage.setItem('loggedInUser', username);

        Alert.alert('Success', 'Login successful');
        navigation.navigate('Profile', { username });
      } else {
        Alert.alert('Error', 'Incorrect password');
      }
    } catch (error) {
      console.error('Error logging in:', error.message);
    }
  };

  return (
    <LinearGradient style={styles.container} colors={["#fff", "#f9f9f9"]}>
      <View style={styles.box}> 
        <Text style={styles.title}>Welcome Back!</Text>
        <View style={styles.specialThanksContainer}>
          <Text style={styles.descr}>Just as developer, want to share that yall very important for me! special thanks💜</Text>
        </View> 
        <TextInput
          style={styles.input}
          placeholder="Username"
          value={username}
          onChangeText={(text) => setUsername(text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={(text) => setPassword(text)}
        />
        <TouchableOpacity style={styles.loginButton} onPress={handleLoginPress}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSignupPress}>
          <Text style={styles.linkText}>Don't have an account? Signup here</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#333',
  },
  input: {
    width: 300,
    height: 40,
    marginBottom: 16,
    padding: 10,
    borderRightWidth: 1,
    borderLeftWidth: 1,
    backgroundColor: "#fff",
  },
  loginButton: {
    backgroundColor: '#2ecc71',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    width: 280,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkText: {
    marginTop: 16,
    color: '#3498db',
    textDecorationLine: 'underline',
  },
  box: {
    backgroundColor: "#f0f0f0",
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  descr: {
    fontSize: 8.3,
  },
  specialThanksContainer: {
    position: "absolute",
    bottom: 0,
    left: 2,
  },
});

export default Login;