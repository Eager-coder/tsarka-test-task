import { default as request } from "supertest"
import db from "../../src/db"
import { testPost } from "./createPost.test"

export const getOnePostTests = () => {
	it("Get one post with valid post ID", async () => {
		const post = (await db.query("SELECT * FROM posts LIMIT 1")).rows[0]

		const res = await request("http://localhost:80")
			.post("/graphql")
			.send({
				query: `
					query {
							getPost(id: "${post.id}") {
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

		expect(res.body).not.toHaveProperty("errors")
		expect(res.body.data.getPost).toEqual(
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
}
