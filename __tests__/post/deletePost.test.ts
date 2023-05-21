import { default as request } from "supertest"
import getUnixTimeNow from "../../src/helpers/getUnixTimeNow"
import User from "../../src/models/User"
import Post from "../../src/models/Post"
import { generateAccessToken } from "../../src/helpers/generateTokens"

export const deletePostTests = () => {
	it("Allow delete for authenticated client", async () => {
		const testUser = {
			id: "d7020992-31c8-45c9-9d74-54d90e85b217",
			name: "TestUser",
			email: `testuserd7020992-31c8-45c9-9d74-54d90e85b217@email.com`,
			password: "123456789",
			date_created: getUnixTimeNow(),
		}
		await User.add(testUser)
		const testPost = {
			id: "cadb863b-98bf-4bb6-92fe-fc6cf299c0c6",
			header: "A post about cats",
			image_url: "https://as2.ftcdn.net/v2/jpg/02/66/72/41/1000_F_266724172_Iy8gdKgMa7XmrhYYxLCxyhx6J7070Pr8.jpg",
			text: "Cats are cute! I like cats. What about you?",
			user_id: testUser.id,
			date: new Date().toISOString(),
		}
		await Post.add(testPost)
		const accessToken = generateAccessToken(testUser.id)

		const res = await request("http://localhost:80")
			.post("/graphql")
			.set("Cookie", `access_token=${accessToken}`)
			.send({
				query: `
          mutation {
           deletePost (id:"${testPost.id}")
          }
			`,
			})
		expect(res.body).not.toHaveProperty("errors")
		expect(res.body.data.deletePost).toBeTruthy()
	})
	it("Forbid delete for authenticated client", async () => {
		const testUser = {
			id: "0c60a11b-8167-4fa7-992f-4eebd7490959",
			name: "TestUser",
			email: `testuser0c60a11b-8167-4fa7-992f-4eebd7490959@email.com`,
			password: "123456789",
			date_created: getUnixTimeNow(),
		}
		await User.add(testUser)
		const testPost = {
			id: "547f22d0-bef4-4ebd-94d1-035e3baef942",
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
          mutation {
           deletePost (id:"${testPost.id}")
          }
			`,
			})
		expect(res.body).toHaveProperty("errors")
		expect(res.body.errors.length).toBeGreaterThan(0)
		expect(res.body.errors[0].extensions.code).toBe("FORBIDDEN")
	})
}
