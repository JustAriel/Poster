import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { deleteAllUsers } from './users';
import postsModule from './posts';

const { deleteAllPosts } = postsModule;

const Admin = () => {
  const handleDeleteAllUsers = async () => {
    Alert.alert(
      'Delete All Users',
      'Are you sure you want to delete all users?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              await deleteAllUsers();
              console.log('All users deleted successfully.');
            } catch (error) {
              console.error('Error deleting all users:', error);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleDeleteAllPosts = async () => {
    Alert.alert(
      'Delete All Posts',
      'Are you sure you want to delete all posts?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              await deleteAllPosts();
              console.log('All posts deleted successfully.');
            } catch (error) {
              console.error('Error deleting all posts:', error);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View>
      <Text>Admin Panel</Text>
      <TouchableOpacity onPress={handleDeleteAllUsers}>
        <Text>Delete All Users</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleDeleteAllPosts}>
        <Text>Delete All Posts</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Admin;
