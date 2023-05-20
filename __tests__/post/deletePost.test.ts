import { default as request } from "supertest"
import { testUser } from "../auth/register.test"
import db from "../../src/db"

// export const testPost = {
// 	header: "A post about cats",
// 	image_url: "https://as2.ftcdn.net/v2/jpg/02/66/72/41/1000_F_266724172_Iy8gdKgMa7XmrhYYxLCxyhx6J7070Pr8.jpg",
// 	text: "Cats are cute! I like cats. What about you?",
// }

export const deletePostTests = () => {
	it("Allow delete a post for authenticated client", async () => {
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
		const userId = loginRes.body.data.login.id
		const postId = (await db.query("SELECT id FROM posts WHERE user_id = $1", [userId])).rows[0].id

		const res = await request("http://localhost:80")
			.post("/graphql")
			.set("Cookie", loginRes.headers["set-cookie"])
			.send({
				query: `
          mutation {
           deletePost (id:"${postId}")
          }
			`,
			})
		expect(res.body).not.toHaveProperty("errors")
		expect(res.body.data.deletePost).toBeTruthy()
	})
}
