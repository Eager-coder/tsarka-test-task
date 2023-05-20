import { default as request } from "supertest"
import { testUser } from "../auth/register.test"

export const testPost = {
	header: "A post about cats",
	image_url: "https://as2.ftcdn.net/v2/jpg/02/66/72/41/1000_F_266724172_Iy8gdKgMa7XmrhYYxLCxyhx6J7070Pr8.jpg",
	text: "Cats are cute! I like cats. What about you?",
}

export const createPostTests = () => {
	it("Allow create post for authenticated client", async () => {
		const loginRes = await request("http://localhost:80")
			.post("/graphql")
			.withCredentials(true)
			.send({
				query: `
					mutation{
					login (data: {email: "${testUser.email}", password: "${testUser.password}" }) {
						id
						name
						email
						date_created
					}
				}
			`,
			})

		const res = await request("http://localhost:80")
			.post("/graphql")
			.set("Cookie", loginRes.headers["set-cookie"])
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
	it("D not allow create a post for unauthenticated client", async () => {
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
	})
}
