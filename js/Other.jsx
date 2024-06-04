import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, FlatList, Alert, RefreshControl } from 'react-native';
import { getBioByUsername, getProfileImageUri, getUserPosts, getBioAndImageByUsername, initializeDatabase, deletePostByUsername } from '../db/users';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { illegalWords } from '../words/illegal';

const Other = ({ route }) => {
  const [userBio, setUserBio] = useState('');
  const [userProfileImage, setUserProfileImage] = useState(null);
  const [posts, setPosts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const { otherUsername } = route.params || {};

  useEffect(() => {
    if (otherUsername) {
      console.log('Fetching data for user:', otherUsername);
      fetchUserBio(otherUsername);
      fetchUserProfileImage(otherUsername);
      fetchUserPosts(otherUsername);
    }
  }, [otherUsername]);

  const fetchUserBio = async (username) => {
    try {
      const result = await getBioAndImageByUsername(username);

      if (result.rows.length > 0) {
        const userData = result.rows.item(0);
        setUserBio(userData.bio);
        console.log('User Bio:', userData.bio);
      }
    } catch (error) {
      console.error('Error fetching user bio:', error);
    }
  };

  const fetchUserPosts = async (username) => {
    try {
      const result = await getUserPosts(username);

      if (result.rows && result.rows.length > 0) {
        const userRow = result.rows.item(0);
        if (userRow && userRow.posts) {
          const userPosts = JSON.parse(userRow.posts);
          const filteredPosts = userPosts.filter(post => !containsIllegalWord(post.content));
          console.log('User posts:', filteredPosts);
          setPosts(filteredPosts);
        }
      } else {
        console.log('No posts found for the user.');
      }
    } catch (error) {
      console.error('Error fetching user posts:', error);
    }
  };

  const containsIllegalWord = (text) => {
    const lowerCaseText = text.toLowerCase();
    return illegalWords.some(word => lowerCaseText.includes(word));
  };

  const fetchUserProfileImage = async (username) => {
    try {
      const imageUri = await getProfileImageUri(username);
      setUserProfileImage(imageUri);
      console.log('User Profile Image:', imageUri);
    } catch (error) {
      console.error('Error fetching user profile image:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUserBio(otherUsername);
    await fetchUserProfileImage(otherUsername);
    await fetchUserPosts(otherUsername);
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <Image
        source={
          userProfileImage
            ? { uri: userProfileImage }
            : require('../images/noneProfile2.jpg')
        }
        style={styles.profileImage}
      />
      <Text style={styles.usernameText}>@{otherUsername}</Text>
      <Text style={styles.bioText}>{userBio ? userBio : 'No bio yet.'}</Text>
      <TouchableOpacity style={styles.linesContainer}>
        <Image source={require('../images/3lines.png')} style={styles.lines} />
      </TouchableOpacity>
      <View style={styles.deviderH} />
      <FlatList
        data={posts}
        renderItem={({ item }) => (
          <View style={styles.postsssContainer}>
            <View style={styles.postssContainer}>
              <Image source={userProfileImage ? { uri: userProfileImage } : require('../images/noneProfile2.jpg')} style={styles.postImage} />
              <Text style={styles.postsUsername}>{otherUsername}</Text>
            </View>
            <Text style={styles.postItem}>{item.content}</Text>
          </View>
        )}
        keyExtractor={(item, index) => index.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4CAF50']} />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  profileImage: {
    width: 200,
    height: 200,
    borderRadius: 20,
    marginBottom: 16,
  },
  bioText: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 10,
  },
  usernameText :{
    fontSize: 16,
    fontWeight: "bold",
  },
  deviderH: {
    backgroundColor: "#000",
    width: 350,
    height: .75,
    marginTop: 5,
    marginBottom: 5,
  },
  linesContainer :{
    justifyContent :"center",
    alignItems:"center",
    marginTop: 20,
  },
  lines: {
    width: 20,
    height: 20,
  },
  postsssContainer: {
    width: 350,
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    marginBottom: 7,
  },
  postsUsername: {
    fontWeight: "bold",
    marginLeft: 18,
  },
  postImage :{
    width: 40,
    height: 40,
    borderRadius: 50,
    marginTop: 7,
  },
  postssContainer: {
    flexDirection :'row',
  },
  postItem :{
    marginLeft: 50,
    marginTop: -27.5,
  },
  deleteButton: {
    backgroundColor: 'red',
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: 'white',
  },
});

export default Other;
