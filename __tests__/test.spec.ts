import { closeServer, main } from "./testServer"
import { registerTests } from "./auth/register.test"
import db from "../src/db"
import { loginTests } from "./auth/login.test"
import { refreshTokenTestings } from "./auth/refreshToken.test"
import { logoutTests } from "./auth/logout.test"
import { getPostsTests } from "./post/getPosts.test"
import { createPostTests } from "./post/createPost.test"
import { getOnePostTests } from "./post/getOnePost.test"
import { deletePostTests } from "./post/deletePost.test"
import { editPostTests } from "./post/editPost.test"

beforeAll(async () => {
	try {
	} catch (error) {
		console.log(error)
	}
	await main()
})
beforeEach(async () => {
	await db.query("TRUNCATE TABLE refresh_tokens CASCADE")
	await db.query("TRUNCATE TABLE posts CASCADE")
	await db.query("TRUNCATE TABLE users CASCADE")
})

afterEach(async () => {
	await db.query("TRUNCATE TABLE refresh_tokens CASCADE")
	await db.query("TRUNCATE TABLE posts CASCADE")
	await db.query("TRUNCATE TABLE users CASCADE")
})

afterAll(async () => {
	closeServer()
	await db.end()
})

describe("Tsarka GraphQL API testing", () => {
	describe("User", () => {
		describe("Register", registerTests)
		describe("Login", loginTests)
		describe("Refresh tokens", refreshTokenTestings)
		describe("Logout", logoutTests)
	})
	describe("Post", () => {
		describe("Create a post", createPostTests)
		describe("Get a post", getOnePostTests)
		describe("Get posts", getPostsTests)
		describe("Edit a post ", editPostTests)
		describe("Delete a post", deletePostTests)
	})
})
