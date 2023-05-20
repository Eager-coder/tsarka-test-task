import { default as request } from "supertest"
import { testUser } from "./register.test"

export const logoutTests = () => {
	it("Logout with authorized client", async () => {
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
			.withCredentials(true)
			.send({
				query: `
					mutation {
						logout
					}
			`,
			})
		expect(res.statusCode).toBe(200)
		expect(res.body.data.logout).toBe("You are logged out")
	})
	it("Login with unauthorized client", async () => {
		const res = await request("http://localhost:80")
			.post("/graphql")
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
