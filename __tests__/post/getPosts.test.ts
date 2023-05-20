import { default as request } from "supertest"

export const getPostsTests = () => {
	it("Get posts with valid page argument", async () => {
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

		expect(res.body.data.getPosts).toMatchObject(
			expect.arrayContaining([
				expect.objectContaining({
					id: expect.any(String),
					header: expect.any(String),
					// text: expect.any(String), // TODO: expect string or null
					// image_url: expect.any(String), // TODO: expect string or null
					user_id: expect.any(String),
					date: expect.any(String),
				}),
			]),
		)
	})
}
