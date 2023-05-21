import { default as request } from "supertest"
import getUnixTimeNow from "../../src/helpers/getUnixTimeNow"
import User from "../../src/models/User"
import Post from "../../src/models/Post"
import crypto from "crypto"

export const getOnePostTests = () => {
	it("Get one post with valid post ID", async () => {
		const testUser = {
			id: "1b839ec4-09e8-4950-b7de-5ebd7643c074",
			name: "TestUser",
			email: `testuser1b839ec4-09e8-4950-b7de-5ebd7643c074787@email.com`,
			password: "123456789",
			date_created: getUnixTimeNow(),
		}
		await User.add(testUser)
		const testPost = {
			id: "0776e627-d485-43fa-8824-0c1f2e2ebd9a",
			header: "A post about cats",
			image_url: "https://as2.ftcdn.net/v2/jpg/02/66/72/41/1000_F_266724172_Iy8gdKgMa7XmrhYYxLCxyhx6J7070Pr8.jpg",
			text: "Cats are cute! I like cats. What about you?",
			user_id: testUser.id,
			date: new Date().toISOString(),
		}
		await Post.add(testPost)
		const res = await request("http://localhost:80")
			.post("/graphql")
			.send({
				query: `
					query {
							getPost(id: "${testPost.id}") {
									id
									header
									text
									image_url
									user_id
									date
							}
					}

			`,
			})

		expect(res.body).not.toHaveProperty("errors")
		expect(res.body.data.getPost).toEqual(expect.objectContaining(testPost))
	})

	it("Get NOT_FOUND for non-existing post", async () => {
		const res = await request("http://localhost:80")
			.post("/graphql")
			.send({
				query: `
					query {
							getPost(id: "${crypto.randomUUID()}") {
									id
									header
									text
									image_url
									user_id
									date
							}
					}

			`,
			})

		expect(res.body).toHaveProperty("errors")
		expect(res.body.errors[0].extensions.code).toBe("NOT_FOUND")
	})
}
