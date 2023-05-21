import { default as request } from "supertest"
import getUnixTimeNow from "../../src/helpers/getUnixTimeNow"
import User from "../../src/models/User"
import Post from "../../src/models/Post"
import { generateAccessToken } from "../../src/helpers/generateTokens"

export const editPostTests = () => {
	it("Edit post header for authenticated client", async () => {
		const testUser = {
			id: "2f36fadf-a00c-40bd-8cb7-1feb70b33e83",
			name: "TestUser",
			email: `testuser2f36fadf-a00c-40bd-8cb7-1feb70b33e83@email.com`,
			password: "123456789",
			date_created: getUnixTimeNow(),
		}
		await User.add(testUser)
		const testPost = {
			id: "f50d097d-7963-4dca-8738-f173c5d43947",
			header: "A post about cats",
			image_url: "https://as2.ftcdn.net/v2/jpg/02/66/72/41/1000_F_266724172_Iy8gdKgMa7XmrhYYxLCxyhx6J7070Pr8.jpg",
			text: "Cats are cute! I like cats. What about you?",
			user_id: testUser.id,
			date: new Date().toISOString(),
		}
		await Post.add(testPost)
		const accessToken = generateAccessToken(testUser.id)

		const editedHeader = "This is edited header"

		const res = await request("http://localhost:80")
			.post("/graphql")
			.set("Cookie", `access_token=${accessToken}`)
			.send({
				query: `
          mutation {
            editPost(
              post: {
                  id: "${testPost.id}",
                  header: "${editedHeader}" 
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
		expect(res.body.data.editPost).toEqual(
			expect.objectContaining({
				...testPost,
				header: editedHeader,
			}),
		)
	})
	it("Forbid editing post header for authenticated client", async () => {
		const testUser = {
			id: "e7d981cc-f8d3-4064-894d-2cd27209cfbd",
			name: "TestUser",
			email: `testusere7d981cc-f8d3-4064-894d-2cd27209cfbd@email.com`,
			password: "123456789",
			date_created: getUnixTimeNow(),
		}
		await User.add(testUser)
		const testPost = {
			id: "2eb12b1a-a0b8-407a-bffa-1eb74e019263",
			header: "A post about cats",
			image_url: "https://as2.ftcdn.net/v2/jpg/02/66/72/41/1000_F_266724172_Iy8gdKgMa7XmrhYYxLCxyhx6J7070Pr8.jpg",
			text: "Cats are cute! I like cats. What about you?",
			user_id: testUser.id,
			date: new Date().toISOString(),
		}
		await Post.add(testPost)

		const editedHeader = "This is edited header"

		const res = await request("http://localhost:80")
			.post("/graphql")
			.send({
				query: `
          mutation {
            editPost(
              post: {
                  id: "${testPost.id}",
                  header: "${editedHeader}" 
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
