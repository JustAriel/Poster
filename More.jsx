import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { LinearGradient } from 'expo-linear-gradient';

const More = ({ route }) => {
  const { image, description } = route.params || {};

  const handleDownload = async () => {
    try {
      const asset = await MediaLibrary.createAssetAsync(image);
      await MediaLibrary.createAlbumAsync('Poster App', asset, false);

      console.log('Image saved to gallery');
      Alert.alert('Downloaded', 'Image saved to gallery');
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  return (
    <LinearGradient colors={['#f0f0f0', '#fff']} style={styles.container}>
      <View style={styles.box}>
        <Text style={styles.description}>{description}</Text>
        <Image source={{ uri: image }} style={styles.image} />
        <TouchableOpacity onPress={handleDownload} style={styles.downloadButton}>
          <Text style={styles.downloadText}>Download</Text>
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
  },
  image: {
    width: 300,
    height: 400,
    resizeMode: 'contain',
    marginBottom: 20,borderRadius: 12,
    position: "absolute",
    bottom: 50,
  },
  description: {
    fontSize: 10,
    color: 'black',
    fontWeight: "bold",
    position: 'absolute',
    top: 395,
    zIndex: 992,
    left: 40,
  },
  downloadText: {
    fontSize: 16,
    color: 'black',
    letterSpacing: 2,
    fontWeight: 'bold',
  },
  downloadButton: {
    backgroundColor: '#fff',
    borderRadius: 15,
    width: 300,
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.97,
    shadowRadius: 4.65,
    elevation: 0,
    position: "absolute",
    bottom: 0,
  },
  box: {
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 992,
    width: 350,
    height: 500,
    backgroundColor: 'rgba(0,0,0,.05)',
    shadowColor: '#fff',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.97,
    shadowRadius: 4.65,
    elevation: 0,
    borderBottomWidth: 1,
    borderTopWidth: 1,
    marginTop: 50,
  },
});

export default More;
