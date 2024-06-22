import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, TextInput, Button } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const Post = ({ route, navigation }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [description, setDescription] = useState('');

  const { username } = route.params || {};
  console.log(username);

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  
      if (status !== 'granted') {
        alert('Sorry, we need camera roll permissions to make this work!');
        return;
      }
  
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
        aspect: [3, 4],
      });
  
      if (!result.canceled) {
        setSelectedImage(result.uri);
      }
    } catch (error) {
      console.error('Error picking an image', error);
    }
  };

  const handlePostClick = () => {
    if (selectedImage) {
      const post = { image: selectedImage, description, username };
      navigation.navigate('Main', { post, username });
    }
  };  

  return (
    <View style={styles.container}>
      {selectedImage ? (
        <View>
          <TouchableOpacity style={styles.changeButton} onPress={pickImage}>
            <Text style={styles.changeText}>CHANGE THE PHOTO</Text>
          </TouchableOpacity>
          <Image source={{ uri: selectedImage }} style={styles.image} />
        </View>
      ) : (
        <TouchableOpacity onPress={pickImage} style={styles.touchableOpacity}>
          <Text style={styles.chooseText}>Choose Image from the gallery</Text>
        </TouchableOpacity>
      )}
      <TextInput
        placeholder='Describe your post.'
        style={styles.textinput}
        onChangeText={(text) => setDescription(text)}
        maxLength={100}
        multiline
      />
      <TouchableOpacity
        onPress={handlePostClick}
        disabled={!selectedImage}
        style={{
          ...styles.postButton,
          backgroundColor: selectedImage ? '#4CAF50' : '#DDDDDD',
        }}
      >
        <Text style={styles.buttonText}>Post your art!</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Main')}>
        <Text style={styles.backText}>Go back home</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  touchableOpacity: {
    backgroundColor: '#DDDDDD',
    padding: 10,
    marginVertical: 10,
    width: 350,
    height: 450,
    borderRadius:18,
  },
  image: {
    width: 350,
    height: 450,
    marginVertical: 20,
    borderRadius: 18,
    marginTop: 30,
  },
  postButton: {
    padding: 10,
    borderRadius: 5,
    marginVertical: 10,
    opacity: ({ selectedImage }) => (selectedImage ? 1 : 0.5),
    width: 350,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 15,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    marginBottom: 50,
  },
  textinput: {
    width: 350,
    height: 38,
    justifyContent: 'center',
    alignItems: "center",
    textAlign: "center",
    borderBottomWidth: 1,
    borderColor: "#ccc",
    marginTop: 30
  },
  changeText: {
    fontSize: 12,
    fontWeight: "bold",
    marginHorizontal: 4,
  },
  changeButton: {
    position: "absolute",
    zIndex: 992,
    top: 35,
    left: 10,
    backgroundColor: "#fff",
    padding: 3,
    borderRadius: 12,
  },
  chooseText: {
    backgroundColor: "#fff",
    width: 232,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    fontWeight: "bold",
  },
  backText :{
    fontSize: 12,
    fontWeight: '400',
  }
});

export default Post;
