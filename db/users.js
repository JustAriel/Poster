import * as SQLite from 'expo-sqlite';
import AsyncStorage from '@react-native-async-storage/async-storage';

const db = SQLite.openDatabase('users.db');

const initializeDatabase = () => {
  return new Promise((resolve, reject) => {
    db.transaction(
      async (tx) => {
        console.log('Creating or verifying table users...');
        tx.executeSql(
          'CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, password TEXT, profileImage TEXT, bio TEXT, posts TEXT);',
          [],
          async (_, result) => {
            console.log('Table users created successfully');
          },
          (_, error) => {
            console.error('Error creating table users:', error);
            reject(error);
          }
        );
      },
      (error) => {
        console.error('Transaction error:', error.message);
        reject(error);
      },
      () => {
        console.log('Transaction completed successfully');
        resolve();
      }
    );
  });
};

const initializeProfileImageKey = async () => {
  try {
    const existingKey = await AsyncStorage.getItem('profileImage');
    if (!existingKey) {
      await AsyncStorage.setItem('profileImage', '');
    }
  } catch (error) {
    console.error('Error initializing profileImage key:', error);
  }
};

const setProfileImageUri = async (username, uri) => {
  try {
    await AsyncStorage.setItem(`profileImage_${username}`, uri);
  } catch (error) {
    console.error('Error setting profile image URI:', error);
  }
};

const getProfileImageUri = async (username) => {
  try {
    const uri = await AsyncStorage.getItem(`profileImage_${username}`);
    return uri;
  } catch (error) {
    console.error('Error getting profile image URI:', error);
    return null;
  }
};

const getBioByUsername = (username) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT bio FROM users WHERE username = ?;',
        [username],
        (_, result) => resolve(result),
        (_, error) => reject(error)
      );
    });
  });
};

const insertBio = (username, bio) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        'UPDATE users SET bio = ? WHERE username = ?;',
        [bio, username],
        (_, result) => {
          console.log('Bio updated successfully');
          resolve(result);
        },
        (_, error) => {
          console.error('Error updating bio:', error);
          reject(error);
        }
      );
    });
  });
};

const insertUser = (username, password) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        'INSERT INTO users (username, password) VALUES (?, ?);',
        [username, password],
        (_, result) => resolve(result),
        (_, error) => reject(error)
      );
    });
  });
};

const getProfileImageByUsername = (username) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT profileImage FROM users WHERE username = ?;',
        [username],
        (_, result) => resolve(result),
        (_, error) => reject(error)
      );
    });
  });
};

const findUserByUsername = (username) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM users WHERE username = ?;',
        [username],
        (_, result) => resolve(result),
        (_, error) => reject(error)
      );
    });
  });
};

export const getUserPosts = async (username) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'SELECT * FROM users WHERE username = ?;',
          [username],
          (_, result) => {
            resolve(result);
          },
          (_, error) => {
            reject(error);
          }
        );
      }
    );
  });
};

export const getBioAndImageByUsername = async (username) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT bio, profileImage FROM users WHERE username = ?;',
        [username],
        (_, result) => {
          resolve(result);
        },
        (_, error) => {
          reject(error);
        }
      );
    });
  });
};

export const getAllUsersPosts = async () => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT username, posts FROM users',
        [],
        (_, result) => {
          const allUsersPosts = result.rows._array;
          console.log('All Users Posts:', allUsersPosts);
          resolve(allUsersPosts);
        },
        (_, error) => {
          reject(error);
        }
      );
    });
  });
};

export const deletePostByUsername = async (username, postId) => {
  try {
    const userRow = await findUserByUsername(username);

    if (userRow && userRow.rows.length > 0) {
      const userData = userRow.rows.item(0);

      if (userData.posts) {
        const userPosts = JSON.parse(userData.posts);
        const updatedPosts = userPosts.filter((post) => post.postId !== postId);

        await insertUser(username, userData.password, userData.profileImage, userData.bio, JSON.stringify(updatedPosts));
      }
    }
  } catch (error) {
    throw error;
  }
};

const deleteAllUsers = () => {
  return new Promise((resolve, reject) => {
    db.transaction(
      async (tx) => {
        console.log('Deleting all users...');
        
        const users = await getAllUsersPosts();
        
        tx.executeSql(
          'DELETE FROM users;',
          [],
          async (_, result) => {
            console.log('All users deleted successfully');
            
            await initializeProfileImageKey();

            users.forEach(async (user) => {
              const { username } = user;
              await AsyncStorage.removeItem(`profileImage_${username}`);
            });

            resolve(result);
          },
          (_, error) => {
            console.error('Error deleting all users:', error);
            reject(error);
          }
        );
      },
      (error) => {
        console.error('Transaction error:', error.message);
        reject(error);
      },
      () => {
        console.log('Transaction completed successfully');
      }
    );
  });
};

export { 
  initializeDatabase, 
  insertUser, 
  findUserByUsername, 
  getProfileImageByUsername, 
  initializeProfileImageKey, 
  setProfileImageUri, 
  getProfileImageUri,
  getBioByUsername,
  insertBio,
  deleteAllUsers,
  db,
};
