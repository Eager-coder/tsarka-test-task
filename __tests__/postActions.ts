import Post, { PostModel } from "../src/models/Post"
import { testUser } from "./userActions"

export const testPost: PostModel = {
	id: "074a7f5e-5a51-4260-9533-fc32d3e4ea39",
	header: "A test header",
	text: null,
	image_url: "https://as2.ftcdn.net/v2/jpg/00/74/15/95/1000_F_74159556_67n5823V7Ei87a4g6JJnYHC0yMSo1AEy.jpg",
	user_id: testUser.id,
	date: new Date().toISOString().split("T")[0],
}

export const createPost = async () => {
	await Post.add(testPost)
}

export const deletePost = async () => {
	await Post.delete(testPost.id)
}
