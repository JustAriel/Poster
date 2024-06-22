import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, FlatList, TextInput, RefreshControl, Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import database from '../db/posts';
import { getProfileImageUri } from '../db/users';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { updatePosts } from '../db/posts';

const Main = ({ route, navigation }) => {
  const [posts, setPosts] = useState([]);
  const [description, setDescription] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);

  const { username } = route.params || {};

  const onRefresh = useCallback(() => {
    setRefreshing(true);

    database
      .getAllPosts()
      .then((updatePosts) => {
        const randomizedPosts = shuffleArray(updatePosts);
        setPosts(randomizedPosts);
        setSearchResults(randomizedPosts);
        setRefreshing(false);
      })
      .catch((error) => {
        console.error('Error refreshing posts:', error);
        setRefreshing(false);
      });
  }, []);

  useEffect(() => {
    database
      .initDatabase()
      .then(() => {
        console.log('Database initialized');
        forceUpdatePosts();
      })
      .catch((error) => console.error('Error initializing database:', error));
  }, []);

  useEffect(() => {
    const { post } = route.params || {};
    if (post) {
      database
        .savePost(post)
        .then(forceUpdatePosts)
        .catch(console.error);
      navigation.setParams({ post: null });
    }
  }, [route.params, navigation]);

  useEffect(() => {
    const results = posts.filter((item) =>
      item.description.toLowerCase().includes(description.toLowerCase())
    );
    setSearchResults(results);
  }, [description, posts]);

  useEffect(() => {
    const fetchProfileImage = async () => {
      try {
        const loggedInUser = await AsyncStorage.getItem('loggedInUser');
        const imageUri = await getProfileImageUri(loggedInUser);
        setProfilePicture(imageUri);
      } catch (error) {
        console.error(error);
      }
    }

    fetchProfileImage()
  }, [])

  const forceUpdatePosts = () => {
    database
      .getAllPosts()
      .then((updatePosts) => {
        const randomizedPosts = shuffleArray(updatePosts);
        setPosts(randomizedPosts);
        setSearchResults(randomizedPosts);
      })
      .catch(console.error);
  };

  const shuffleArray = (array) => {
    const shuffledArray = [...array];
    for (let i = shuffledArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
    }
    return shuffledArray;
  };

  const handleDownload = async (item) => {
    try {
      console.log('Image URI:', item.image);
      const asset = await MediaLibrary.createAssetAsync(item.image);
      await MediaLibrary.createAlbumAsync('Poster App', asset, false);
  
      console.log('Image saved to gallery');
      Alert.alert('Downloaded', 'Image saved to gallery');
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };   

  const handleDelete = async (item) => {
    const loggedInUser = await AsyncStorage.getItem('loggedInUser');

    if (loggedInUser === item.username || loggedInUser === 'ArtemScherban') {
      Alert.alert(
        'Delete Image',
        'Are you sure you want to delete this image?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Delete',
            onPress: async () => {
              try {
                const filePath = item.image;
  
                await FileSystem.deleteAsync(filePath, { idempotent: true });
  
                await database.deletePost(item.id);
                forceUpdatePosts();
              } catch (error) {
                console.error('Error deleting image:', error);
              }
            },
          },
        ],
        { cancelable: false }
      );
    }
  };

  useEffect(() => {
    database
      .getAllPosts()
      .then((updatePosts) => {
        const randomizedPosts = shuffleArray(updatePosts);
        setPosts(randomizedPosts);
        setSearchResults(randomizedPosts);
      })
      .catch(console.error);
  }, []);

  const goToMoreScreen = (image, description) => {
    navigation.navigate('More', { image, description });
  };
  
  const goToOtherScreen = (item) => {
    navigation.navigate('Other', {
      otherUsername: item.username,
      userPosts: item.userPosts,
    });
  };
  
  const renderPost = ({ item }) => (
    <View style={styles.postContainer}>
      {item.image && (
        <TouchableOpacity onLongPress={() => handleDelete(item)} onPress={() => goToMoreScreen(item.image, item.description)}>
          <Image source={{ uri: item.image }} style={styles.image} />
        </TouchableOpacity>
      )}
      <TouchableOpacity onPress={() => handleDownload(item)} style={styles.close}>
        <Image source={require('../images/download.png')} style={styles.download} />
      </TouchableOpacity>
      <Text style={styles.postText}>{item.description}</Text>
      <TouchableOpacity onPress={() => goToOtherScreen(item)} style={styles.usernameButton}>
        <Text style={styles.usernameText}>{item.username}</Text>
      </TouchableOpacity>
    </View>
  );       

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.profileButton} onPress={() => navigation.navigate('Profile')}>
          <Image source={profilePicture ? { uri: profilePicture } : require('../images/noneProfile2.jpg') } style={styles.profileImage} />
        </TouchableOpacity>
        <TextInput
          placeholder="What are you looking for?"
          style={styles.textinput}
          value={description}
          onChangeText={(text) => setDescription(text)}
          maxLength={100}
        />
      </View>
      <FlatList
        data={searchResults}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderPost}
        showsVerticalScrollIndicator={false}
        numColumns={2}
        contentContainerStyle={styles.flatListContainer}
        shouldItemUpdate={(props, nextProps) => {
          return props.item !== nextProps.item;
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4CAF50']} />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flatListContainer: {
    alignItems: 'center',
  },
  postContainer: {
    alignItems: 'center',
    marginVertical: 3,
    width: '50%',
    backgroundColor: "#fff",
    width: 200,
    marginRight: 2,
    marginLeft: 2,
    borderBottomWidth: .7,
  },
  image: {
    width: 200,
    height: 250,
    borderTopRightRadius: 12,
    borderTopLeftRadius: 12,
  },
  textinput: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 15,
    padding: 8,
    marginLeft: 0,
    marginRight: 5,
    marginVertical: 5,
    width: '80%',
    letterSpacing: 1,
  },
  addButton: {
    borderWidth: 1,
    borderRadius: 15,
    backgroundColor: "#333",
    borderColor: "#333",
    marginTop: 5,
  },
  addImage: {
    width: 44,
    height: 44,
    borderRadius: 911.2,
  },
  header: {
    flexDirection: "row",
    marginTop: 40,
    borderBottomWidth: .5,
  },
  postText: {
    color: "#000",
    paddingVertical: 4,
    fontWeight: "bold",
    fontSize: 12,
    marginHorizontal: 8,
    textAlign: 'center',
  },
  close: {
    position: 'absolute',
    right: 10,
    top: 10,
    width: 20,
    height: 25,
    backgroundColor: "rgba(255,255,255,.1)",
    borderRadius: 6,
  },
  download: {
    width: 20,
    height: 20,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  profileButton: {
    width: 45,
    height: 45,
    marginTop: 6,
    marginRight: 10,
  },
  profileImage: {
    width: 45,
    height: 45,
    borderRadius: 150,
  },
  usernameText: {
    fontSize: 10,
    color: "#fff",
  },
  usernameButton: {
    backgroundColor: "rgba(255,255,255,.1)",
    padding: 3,
    borderRadius: 6,
    position: "absolute",
    left: 5,
    top: 10,
  }
});

export default Main;
