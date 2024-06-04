import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import Admin from '../db/Admin';

const Writer = ({ route, navigation }) => {
  const [postContent, setPostContent] = useState('');
  const { onPost, onCancel, posts } = route.params || {};

  const handleCancel = () => {
    onCancel && onCancel();
  };

  const handlePost = async () => {
    navigation.navigate('Profile');
    onPost && onPost(postContent, posts);
  };

  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
          <Text style={styles.buttonTextC}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton} onPress={handlePost}>
          <Text style={styles.buttonTextS}>Post</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.headerText}>Share your ideas</Text>
      <TextInput
        style={styles.input}
        multiline
        placeholder="Type and share your next photo ideas here..."
        value={postContent}
        onChangeText={(text) => setPostContent(text)}
        textAlignVertical="top"
        maxLength={300}
      />
      {/* <Admin /> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign:"center",
    position: 'absolute',
    top: 100,
    left: 110,
  },
  input: {
    height: 190,
    borderColor: '#000',
    padding: 10,
    marginBottom: 20,
    borderRightWidth: .5,
    borderLeftWidth: .5,
    letterSpacing: 1,
    backgroundColor: "rgba(255,255,255,.9)"
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: "absolute",
    backgroundColor: "#ccc",
    width: 414,
    paddingTop: 20,
    top: 0,
    paddingBottom: 10,
    paddingHorizontal:10,
  },
  saveButton: {
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 15,
    backgroundColor: "#4CAF50",
    width: 130,
    height: 45,
    marginRight: 30,
    justifyContent: "center",
  },
  cancelButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    flex: 1,
    marginTop: 10,
    marginRight: 10,
  },
  buttonTextC: {
    color: '#000',
    fontWeight: 'bold',
  },
  buttonTextS: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default Writer;
