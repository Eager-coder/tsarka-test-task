import { default as request } from "supertest"
import getUnixTimeNow from "../../src/helpers/getUnixTimeNow"
import User from "../../src/models/User"
import { generateAccessToken, generateRefreshToken } from "../../src/helpers/generateTokens"

export const testPost = {
	header: "A post about cats",
	image_url: "https://as2.ftcdn.net/v2/jpg/02/66/72/41/1000_F_266724172_Iy8gdKgMa7XmrhYYxLCxyhx6J7070Pr8.jpg",
	text: "Cats are cute! I like cats. What about you?",
}

export const createPostTests = () => {
	it("Allow create post for authenticated client", async () => {
		const testUser = {
			id: "1b839ec4-09e8-4950-b7de-5ebd7643c074",
			name: "TestUser",
			email: `testuser1b839ec4-09e8-4950-b7de-5ebd7643c074787@email.com`,
			password: "123456789",
			date_created: getUnixTimeNow(),
		}
		await User.add(testUser)
		const accessToken = generateAccessToken(testUser.id)

		const res = await request("http://localhost:80")
			.post("/graphql")
			.set("Cookie", `access_token=${accessToken}`)
			.send({
				query: `
          mutation {
            addPost(
              post: {
                  header: "${testPost.header}", 
                  image_url: "${testPost.image_url}", 
                  text: "${testPost.text}"
              }) {
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
		expect(res.body.data.addPost).toEqual(
			expect.objectContaining({
				id: expect.any(String),
				header: testPost.header,
				text: testPost.text,
				image_url: testPost.image_url,
				user_id: expect.any(String),
				date: expect.any(String),
			}),
		)
	})
	it("Forbid create a post for unauthenticated client", async () => {
		const res = await request("http://localhost:80")
			.post("/graphql")
			.send({
				query: `
          mutation {
            addPost(
              post: {
                  header: "${testPost.header}", 
                  image_url: "${testPost.image_url}", 
                  text: "${testPost.text}"
              }) {
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
		expect(res.body.errors.length).toBeGreaterThan(0)
		expect(res.body.errors[0].extensions.code).toBe("FORBIDDEN")
	})
}
