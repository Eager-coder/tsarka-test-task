import { default as request } from "supertest"
import getUnixTimeNow from "../../src/helpers/getUnixTimeNow"
import User from "../../src/models/User"
import Post from "../../src/models/Post"

export const getPostsTests = () => {
	it("Get posts with valid page argument", async () => {
		const testUser = {
			id: "1b839ec4-09e8-4950-b7de-5ebd7643c074",
			name: "TestUser",
			email: `testuser1b839ec4-09e8-4950-b7de-5ebd7643c074787@email.com`,
			password: "123456789",
			date_created: getUnixTimeNow(),
		}
		await User.add(testUser)
		const testPost1 = {
			id: "292e1009-0f2d-4ce0-aff3-70e87acc0129",
			header: "A post about cats",
			image_url: "https://as2.ftcdn.net/v2/jpg/02/66/72/41/1000_F_266724172_Iy8gdKgMa7XmrhYYxLCxyhx6J7070Pr8.jpg",
			text: "Cats are cute! I like cats. What about you?",
			user_id: testUser.id,
			date: new Date().toISOString(),
		}
		const testPost2 = {
			id: "992d0737-b12b-4e9e-8dd5-b3fe04752058",
			header: "Another post about cats",
			image_url: "https://as2.ftcdn.net/v2/jpg/02/66/72/41/1000_F_266724172_Iy8gdKgMa7XmrhYYxLCxyhx6J7070Pr8.jpg",
			text: "I like cats. Cats are cute! What about you?",
			user_id: testUser.id,
			date: new Date().toISOString(),
		}
		await Post.add(testPost1)
		await Post.add(testPost2)

		const res = await request("http://localhost:80")
			.post("/graphql")
			.send({
				query: `
					query  {
            getPosts(page: ${1}) {
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

		expect(res.body.data.getPosts).toEqual([testPost1, testPost2])
	})
	it("Get BAD_USER_INPUT for invalid page argument (page = -5)", async () => {
		const testUser = {
			id: "1b839ec4-09e8-4950-b7de-5ebd7643c074",
			name: "TestUser",
			email: `testuser1b839ec4-09e8-4950-b7de-5ebd7643c074787@email.com`,
			password: "123456789",
			date_created: getUnixTimeNow(),
		}
		await User.add(testUser)
		const testPost1 = {
			id: "292e1009-0f2d-4ce0-aff3-70e87acc0129",
			header: "A post about cats",
			image_url: "https://as2.ftcdn.net/v2/jpg/02/66/72/41/1000_F_266724172_Iy8gdKgMa7XmrhYYxLCxyhx6J7070Pr8.jpg",
			text: "Cats are cute! I like cats. What about you?",
			user_id: testUser.id,
			date: new Date().toISOString(),
		}
		const testPost2 = {
			id: "992d0737-b12b-4e9e-8dd5-b3fe04752058",
			header: "Another post about cats",
			image_url: "https://as2.ftcdn.net/v2/jpg/02/66/72/41/1000_F_266724172_Iy8gdKgMa7XmrhYYxLCxyhx6J7070Pr8.jpg",
			text: "I like cats. Cats are cute! What about you?",
			user_id: testUser.id,
			date: new Date().toISOString(),
		}
		await Post.add(testPost1)
		await Post.add(testPost2)

		const res = await request("http://localhost:80")
			.post("/graphql")
			.send({
				query: `
					query  {
            getPosts(page: ${-5}) {
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
		expect(res.body.errors[0].extensions.code).toBe("BAD_USER_INPUT")
	})
}
