import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { insertUser, initializeDatabase, findUserByUsername } from '../db/users';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { offensiveWords } from '../words/offensive';

const Signup = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLoginPress = () => {
    navigation.navigate('Login');
  };

  const isUsernameOffensive = () => {
    const lowerCaseUsername = username.toLowerCase();
    return offensiveWords.some(word => lowerCaseUsername.includes(word));
  };

  const handleInputChange = (text) => {
    const englishOnly = text.replace(/[^a-zA-Z]/g, '');
    setUsername(englishOnly);
  };

  const handleSignupPress = async () => {
    try {
      await initializeDatabase();
  
      if (isUsernameOffensive()) {
        Alert.alert('Error', 'Username contains offensive words. Please choose a different username.');
        console.log('Username contains offensive words.');
        return;
      }
  
      if (username.length < 3 || username.length > 20 || password.length < 3) {
        Alert.alert('Error', 'Username and password must be at least 3 to 20 characters long.');
        console.log('Username or password is too short.');
        return;
      }
  
      console.log('Checking existing user...');
      const existingUser = await findUserByUsername(username);
      console.log('Existing user:', existingUser);
  
      if (existingUser.rows.length > 0) {
        Alert.alert('Error', 'Username already exists. Please choose a different username.');
        console.log('Username already exists.');
        return;
      }
  
      console.log('Creating new user...');
      const result = await insertUser(username, password);
      console.log('Signup result:', result);
  
      if (result.insertId) {
        const userId = result.insertId;
  
        await AsyncStorage.setItem('loggedInUser', username);
        await AsyncStorage.setItem('userId', userId.toString());
  
        Alert.alert('Success', 'Signup successful');
        console.log('Navigating to Profile...');
        navigation.navigate('Profile', { username, userId });
      } else {
        Alert.alert('Error', 'Signup failed');
      }
    } catch (error) {
      console.error('Error signing up:', error.message);
      Alert.alert('Error', 'Signup failed');
    }
  };  

  return (
    <LinearGradient style={styles.container} colors={["#fff", "#f9f9f9"]}>
      <View style={styles.box}>
        <View style={styles.specialThanksContainer}>
          <Text style={styles.descr}>Just as developer, want to share that yall very important for me! special thanks💜</Text>
        </View> 
        <Text style={styles.title}>Create an Account</Text>
        <TextInput
          style={styles.input}
          placeholder="Username"
          value={username}
          onChangeText={handleInputChange}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={(text) => setPassword(text)}
        />
        <TouchableOpacity style={styles.signupButton} onPress={handleSignupPress}>
          <Text style={styles.buttonText}>Signup</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleLoginPress}>
          <Text style={styles.linkText}>Already have an account? Login here</Text>
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
  signupButton: {
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

export default Signup;