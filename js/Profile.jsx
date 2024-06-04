import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, RefreshControl, TextInput, Alert, LogBox } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { db, initializeDatabase, setProfileImageUri, getProfileImageUri, getBioByUsername, insertBio, deletePostByUsername } from '../db/users';
import { illegalWords } from '../words/illegal';

const Profile = ({ navigation }) => {
  const [username, setUsername] = useState('Unknown');
  const [profileImage, setProfileImage] = useState(require('../images/noneProfile2.jpg'));
  const [refreshing, setRefreshing] = useState(false);
  const [editBioMode, setEditBioMode] = useState(false);
  const [bio, setBio] = useState('');
  const [storedBio, setStoredBio] = useState('');
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetchLoggedInUser();
  }, []);

  const fetchLoggedInUser = async () => {
    try {
      await initializeDatabase();

      const loggedInUser = await AsyncStorage.getItem('loggedInUser');
      if (loggedInUser) {
        setUsername(loggedInUser);

        const imageUri = await getProfileImageUri(loggedInUser);
        if (imageUri) {
          setProfileImage({ uri: imageUri });
        }

        const bioFromStorage = await AsyncStorage.getItem(`bio_${loggedInUser}`);
        setBio(bioFromStorage || '');
        setStoredBio(bioFromStorage || '');

        const postsString = await AsyncStorage.getItem(`posts_${loggedInUser}`);
        const userPosts = postsString ? JSON.parse(postsString) : [];
        setPosts(userPosts);
        
        console.log(userPosts);
      }
    } catch (error) {
      console.error('Error fetching logged-in user:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchLoggedInUser();
  }, []);

  const handleImagePick = async () => {
    if (username !== 'Unknown') {

      try {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 4],
          quality: 1,
        });
  
        if (!result.cancelled) {
          const newImageUri = result.uri;
          setProfileImage({ uri: newImageUri });
          await setProfileImageUri(username, newImageUri);
        }
      } catch (error) {
        console.error('Error picking image:', error);
      }
    } else {
      Alert.alert(
        'Create Account',
        'To add a profile picture, you need to have an account. Would you like to create one?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Create Account',
            onPress: () => {
              navigation.navigate('Signup');
            },
          },
        ],
        { cancelable: true }
      );
    }
  };

  const handleSaveBio = async () => {
    await insertBio(username, bio);
    await AsyncStorage.setItem(`bio_${username}`, bio);
    setEditBioMode(false);
    setStoredBio(bio);
  };

  const handleEditBio = () => {
    if (username !== 'Unknown') {
      setEditBioMode(true);
    } else {
      Alert.alert(
        'Create Account',
        'To edit a bio, you need to have an account. Would you like to create one?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Create Account',
            onPress: () => {
              navigation.navigate('Signup');
            },
          },
        ],
        { cancelable: true }
      );
    }
  };

  const containsIllegalWord = (text) => {
    const lowerCaseText = text.toLowerCase();
    return illegalWords.some(word => lowerCaseText.includes(word));
  };

  const handlePost = async (postContent) => {
    try {

      if (containsIllegalWord(postContent)) {
        Alert.alert('Warning', 'Your post contains offensive words. Please remove them.');
        return;
      }
      const storedPostsString = await AsyncStorage.getItem(`posts_${username}`);
      const existingPosts = storedPostsString ? JSON.parse(storedPostsString) : [];
  
      const newPost = { content: postContent, username: username };
  
      const newPosts = [newPost, ...existingPosts];
  
      const newPostsString = JSON.stringify(newPosts);
      await AsyncStorage.setItem(`posts_${username}`, newPostsString);
  
      setPosts(newPosts);
  
      await insertPostIntoDatabase(username, postContent);
  
      navigation.navigate('Profile', { posts: newPosts });
    } catch (error) {
      console.error('Error handling post:', error);
    }
  };
  
  const insertPostIntoDatabase = async (username, postContent) => {
    try {
      db.transaction((tx) => {
        tx.executeSql(
          'UPDATE users SET posts = ? WHERE username = ?;',
          [JSON.stringify([{ content: postContent }]), username],
          (_, result) => {
            console.log('Post updated successfully in SQLite');
          },
          (_, error) => {
            console.error('Error updating post in SQLite:', error);
          }
        );
      });
    } catch (error) {
      console.error('Error inserting post into database:', error);
    }
  };

  const handleCancel = () => {
    navigation.navigate('Profile');
  }

  const handleDeletePost = (postId) => {
    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              const storedPostsString = await AsyncStorage.getItem(`posts_${username}`);
              const existingPosts = storedPostsString ? JSON.parse(storedPostsString) : [];
              const updatedPosts = existingPosts.filter((post) => post.postId !== postId);
              await AsyncStorage.setItem(`posts_${username}`, JSON.stringify(updatedPosts));

              await deletePostByUsername(username, postId);

              setPosts(updatedPosts);
            } catch (error) {
              console.error('Error deleting post:', error);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  LogBox.ignoreLogs(['Non-serializable values were found in the navigation state']);

  const goToPostScreen = () => {
    if (username && username !== "Unknown") {
      navigation.navigate('Post', { onPost: handlePost, username });
    } else {
      Alert.alert(
        'Create Account',
        'To create a post, you need to have an account. Would you like to create one?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Create Account',
            onPress: () => {
              navigation.navigate('Signup');
            },
          },
        ],
        { cancelable: true }
      );
    }
  };

  const handleToPost = () => {
    if (username !== 'Unknown') {
      navigation.navigate('Writer', {
        onPost: (postContent, posts) => handlePost(postContent, posts),
        onCancel: handleCancel, username,
        posts: posts,
      })
    } else {
      Alert.alert(
        'Create Account',
        'To create a post, you need to have an account. Would you like to create one?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Create Account',
            onPress: () => {
              navigation.navigate('Signup');
            },
          },
        ],
        { cancelable: true }
      );
    }
  }

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ alignItems: 'center' }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4CAF50']} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.nickname}>{username}</Text>
        <View style={styles.devider} />
        <TouchableOpacity onPress={() => navigation.navigate('Signup')} style={styles.loginButton}>
          <Text style={styles.loginText}>Auth</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={handleImagePick}>
        <Image source={profileImage} style={styles.profileImage} />
      </TouchableOpacity>
      {editBioMode ? (
        <View style={styles.bioInputContainer}>
          <TextInput
            style={styles.bioInput}
            placeholder="Enter your bio..."
            value={bio}
            multiline
            onChangeText={(text) => setBio(text)}
            maxLength={80}
          />
          <View style={{ flexDirection: "row", justifyContent: "space-between", }}>
            <TouchableOpacity onPress={handleSaveBio} style={styles.cancelButton}>
              <Text style={styles.saveText}>CANCEL</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSaveBio} style={styles.saveButton}>
              <Text style={styles.saveText}>SAVE</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <>
          <View style={styles.buttonsView}>
            <TouchableOpacity onPress={handleEditBio}>
              <View style={styles.editBioZone}>
                <Text style={styles.buttonsText}>Edit Biography</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleToPost}
            >
              <View style={styles.subButton}>
                <Text style={styles.buttonsText}>+</Text>
              </View>
            </TouchableOpacity>
          </View>
          <Text style={styles.displayedBio}>
            {storedBio ||
              `${username}, Welcome to Poster! \nExpress yourself with amazing posts.`
            }
          </Text>
        </>
      )}
      <View style={{ flexDirection: 'row', justifyContent:'space-between', }}>
        <TouchableOpacity style={styles.linesContainer}>
          <Image source={require('../images/3lines.png')} style={styles.lines} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.linesContainer} onPress={goToPostScreen}>
          <Image source={require('../images/3add.png')} style={styles.lines} />
        </TouchableOpacity>
      </View>
      <View style={styles.deviderH} />
      <View style={styles.postContanerssss}>
        {posts.map((post, index) => {
          console.log("The whole user posts: ", post.content);
          return (
            <View style={styles.postsssContainer} key={index}>
            <TouchableOpacity
              key={index}
              onPress={() => handleDeletePost(post.postId)}
              onLongPress={() => handleDeletePost(post.postId)}
            >
              <View style={styles.postssContainer}>
                <Image source={profileImage} style={styles.postImage} />
                <Text style={styles.postsUsername}>{username}</Text>
              </View>
              <Text style={styles.postItem}>{post.content}</Text>
            </TouchableOpacity>
            </View>
          )
        })}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  nickname: {
    fontSize: 16,
    fontWeight: 'bold',
    paddingLeft: 50,
  },
  profileImage: {
    width: 200,
    height: 200,
    borderRadius: 20,
    marginBottom: 20,
    marginTop: 20,
  },
  header: {
    justifyContent: 'space-between',
    flexDirection: "row",
    backgroundColor: "#ccc",
    width: 414,
    height: 95,
    paddingHorizontal: 30,
    alignItems: "center",
    paddingTop: 30,
  },
  loginButton :{
    justifyContent: 'center',
    alignItems: "center",
    width: 127,
    height: 40,
    backgroundColor: "#4CAF50",
    borderRadius: 22,
    paddingHorizontal: 30,
  },
  loginText: {
    fontWeight: "bold",
    color: "#fff",
  },
  devider: {
    width: 1,
    height: 40,
    backgroundColor: "#888",
  },
  postContainer: {
    margin: 10,
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: "#000",
    zIndex: 9992,
    height: 400,
    width: 414,
  },
  postImage: {
    width: 200,
    height: 200,
  },
  editBioZone: {
    backgroundColor: '#4CAF50',
    padding: 10,
    paddingHorizontal: 15,
    marginVertical: 0,
    borderRadius: 10,
  },
  bioInputContainer: {
    alignItems: 'center',
    backgroundColor: "#f0f0f0",
    padding: 10,
    borderRightWidth: .3,
    borderLeftWidth: .3,
  },
  bioInput: {
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    padding: 10,
    width: 300,
    marginBottom: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  displayedBio: {
    textAlign: "center",
    letterSpacing: .5,
    lineHeight: 15,
    width: 250,
    fontWeight: 'bold',
    fontSize: 13,
  },
  saveButton:{
    backgroundColor: "#4CAF50",
    width: 140,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 5,
  },
  cancelButton: {
    backgroundColor: "#D3D3D3",
    width: 140,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 5,
  },
  saveText: {
    color: "#fff",
    fontWeight: "bold",
    letterSpacing: 1.5,
  },
  subButton: {
    width:50,
    backgroundColor: "#111",
    height: 40,
    borderRadius: 12, 
    marginLeft: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonsView: {
    flexDirection: "row",
    marginBottom: 10,
  },
  buttonsText: {
    color: "#fff",
    fontWeight: "bold",
    letterSpacing: 1,
  },
  deviderH: {
    width: 350,
    height: .75,
    backgroundColor: "#000",
    marginBottom: 10,
    marginTop: 3,
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
  linesContainer :{
    marginTop: 10,
    marginHorizontal: 70,
  },
  lines: {
    width: 20,
    height: 20,
  },
  backButton: {
    width: 40,
    height: 40,
  },
  backContainer: {
    position: "absolute",
    top: 40,
    left:20,
    width: 40,
    height: 40,
  },
});

export default Profile;
