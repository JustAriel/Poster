import { getAllUsersPosts } from "./db/users";

( async () => {
  try {
    const allUsersPosts = await getAllUsersPosts();

    allUsersPosts.rows._array.forEach((users) => {
      console.log(`User: ${users.username}`);
      const posts = users.posts ? JSON.parse(users.posts):[];
      console.log("Posts: ", posts);
    })
  } catch (error) {
    console.error("error getting the whole users posts: ", error);
  }
})()

export default getPosts