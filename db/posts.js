import * as FileSystem from 'expo-file-system';
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('posts.db');

const initDatabase = () => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'SELECT name FROM sqlite_master WHERE type="table" AND name="posts";',
          [],
          (_, result) => {
            const tableExists = result.rows.length > 0;

            if (!tableExists) {
              tx.executeSql(
                'CREATE TABLE IF NOT EXISTS posts (id INTEGER PRIMARY KEY AUTOINCREMENT, image TEXT, description TEXT, username TEXT);',
                [],
                resolve,
                (_, error) => reject(error)
              );
            } else {
              resolve();
            }
          },
          (_, error) => reject(error)
        );
      },
      null,
      null
    );
  });
};

const getAllPosts = () => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql('SELECT * FROM posts;', [], (_, { rows }) => {
          resolve(rows._array);
        });
      },
      null,
      (_, error) => reject(error)
    );
  });
};

const savePost = async ({ image, description, username }) => {
  try {
    const fileName = image.split('/').pop();
    const newPath = FileSystem.documentDirectory + fileName;

    await FileSystem.moveAsync({
      from: image,
      to: newPath,
    });

    const post = { image: newPath, description, username };

    return new Promise((resolve, reject) => {
      db.transaction(
        (tx) => {
          tx.executeSql(
            'INSERT INTO posts (image, description, username) VALUES (?, ?, ?);',
            [post.image, post.description, post.username],
            (_, { insertId }) => resolve(insertId),
            (_, error) => reject(error)
          );
        },
        null,
        null
      );
    });
  } catch (error) {
    console.error('Error saving post:', error);
  }
};

const deletePost = (postId) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'DELETE FROM posts WHERE id = ?;',
          [postId],
          (_, result) => resolve(result),
          (_, error) => reject(error)
        );
      },
      null,
      null
    );
  });
};

const getPostsByPage = (page) => {
  const itemsPerPage = 10;
  const offset = (page - 1) * itemsPerPage;

  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'SELECT * FROM posts ORDER BY id DESC LIMIT ? OFFSET ?;',
          [itemsPerPage, offset],
          (_, result) => resolve(result.rows._array),
          (_, error) => reject(error)
        );
      },
      (error) => reject(error)
    );
  });
};

const deleteAllPosts = () => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'DELETE FROM posts;',
          [],
          (_, result) => {
            console.log('All posts deleted successfully');
            resolve(result);
          },
          (_, error) => {
            console.error('Error deleting all posts:', error);
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

export default {
  initDatabase,
  getAllPosts,
  savePost,
  deletePost,
  getPostsByPage,
  deleteAllPosts,
}; 