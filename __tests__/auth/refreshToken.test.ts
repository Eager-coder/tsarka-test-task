import { default as request } from "supertest"
import { testUser } from "./register.test"
import cookie from "cookie"

export const refreshTokenTestings = () => {
	it("Refresh tokens with valid refresh_token", async () => {
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

		const { access_token } = cookie.parse(loginRes.headers["set-cookie"][0])
		const { refresh_token } = cookie.parse(loginRes.headers["set-cookie"][1])
		const res = await request("http://localhost:80")
			.post("/graphql")
			.set("Cookie", loginRes.headers["set-cookie"])
			.withCredentials(true)
			.send({
				query: `
					mutation {
						refreshToken
					}
			`,
			})
		expect(res.statusCode).toBe(200)
		expect(res.body.data.refreshToken).toBe("Token refreshed")
	})
	it("Refresh tokens with INvalid refresh_token", async () => {
		const res = await request("http://localhost:80")
			.post("/graphql")
			.set("Cookie", "refresh_token=" + (Math.random() * 10000).toString())
			.withCredentials(true)
			.send({
				query: `
					mutation {
						refreshToken
					}
			`,
			})
		expect(res.body).toHaveProperty("errors")
		expect(res.body.errors.length).toBeGreaterThan(0)
	})
}
