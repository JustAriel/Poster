import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDoc, getDocs } from 'firebase/firestore';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyC1Njsusq3KvoOxUgO8pe2pJ3oO9flmyn8',
  authDomain: 'poster-social-media.firebaseapp.com',
  projectId: 'poster-social-media',
  storageBucket: 'poster-social-media.appspot.com',
  messagingSenderId: '28637152645',
  appId: '1:28637152645:android:d74e37bb12e9a5acc870ec',
};

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

const app = initializeApp(firebaseConfig);

if (!app) {
  console.error('Failed to initialize Firebase app.');
} else {
  console.log('Firebase app initialized successfully.');
}

// Authentication functions
export const signUp = async (username, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, `${username}@example.com`, password);
    const userId = userCredential.user.uid;

    // Create a user document in Firestore
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, { username, bio: '', profileImageUrl: '' });

    return userId;
  } catch (error) {
    console.error('Error signing up:', error.message);
    throw new Error('Signup failed');
  }
};

export const signIn = async (username, password) => {
  try {
    await signInWithEmailAndPassword(auth, `${username}@example.com`, password);
  } catch (error) {
    console.error('Error logging in:', error.message);
    throw new Error('Login failed');
  }
};

export const signOutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error.message);
    throw new Error('Sign out failed');
  }
};

// Database functions
export const insertUser = async (username, password) => {
  // This function is no longer needed as user data is handled during sign-up
};

export const findUserByUsername = async (username) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', username));
    return userDoc.exists() ? userDoc.data() : null;
  } catch (error) {
    console.error('Error finding user by username:', error);
    throw new Error('User not found');
  }
};

export const updateUserBio = async (username, bio) => {
  try {
    const userRef = doc(db, 'users', username);
    await setDoc(userRef, { bio }, { merge: true });
  } catch (error) {
    console.error('Error updating user bio:', error);
    throw new Error('Bio update failed');
  }
};

export const updateUserProfileImage = async (username, imageUri) => {
  try {
    const storageRef = storageRef(storage, `profileImages/${username}.jpg`);
    const response = await fetch(imageUri);
    const blob = await response.blob();

    await uploadBytes(storageRef, blob, { contentType: 'image/jpeg' });

    const downloadURL = await getDownloadURL(storageRef);

    // Update the user document in Firestore with the new profile image URL
    await updateUserProfileImageUrl(username, downloadURL);

    return downloadURL;
  } catch (error) {
    console.error('Error updating user profile image:', error);
    throw new Error('Profile image update failed');
  }
};

const updateUserProfileImageUrl = async (username, profileImageUrl) => {
  try {
    const userRef = doc(db, 'users', username);
    await setDoc(userRef, { profileImageUrl }, { merge: true });
  } catch (error) {
    console.error('Error updating user profile image URL in Firestore:', error);
    throw new Error('Profile image URL update failed');
  }
};

// ... (existing code)

export const getBioByUsername = async (username) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', username));
    return userDoc.exists() ? userDoc.data().bio || '' : '';
  } catch (error) {
    console.error('Error fetching user bio:', error);
    throw new Error('Bio fetch failed');
  }
};

export const getProfileImageUri = async (username) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', username));
    return userDoc.exists() ? userDoc.data().profileImageUrl || '' : '';
  } catch (error) {
    console.error('Error fetching user profile image URL:', error);
    throw new Error('Profile image URL fetch failed');
  }
};

export const insertPost = async (username, postContent) => {
  try {
    const postsCollection = collection(db, 'users', username, 'posts');
    await setDoc(doc(postsCollection), { content: postContent, timestamp: new Date() });
  } catch (error) {
    console.error('Error inserting post:', error);
    throw new Error('Post insertion failed');
  }
};

export const getUserPosts = async (username) => {
  try {
    const postsCollection = collection(db, 'users', username, 'posts');
    const querySnapshot = await getDocs(postsCollection);
    return querySnapshot.docs.map(doc => doc.data());
  } catch (error) {
    console.error('Error fetching user posts:', error);
    throw new Error('User posts fetch failed');
  }
};

export const deleteUserPost = async (username, postId) => {
  try {
    const postDoc = doc(db, 'users', username, 'posts', postId);
    await deleteDoc(postDoc);
  } catch (error) {
    console.error('Error deleting user post:', error);
    throw new Error('User post deletion failed');
  }
};

export const getProfile = async (username) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', username));
    return userDoc.exists() ? userDoc.data() : null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw new Error('User profile fetch failed');
  }
};