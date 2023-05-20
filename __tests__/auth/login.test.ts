import { default as request } from "supertest"
import { testUser } from "./register.test"

export const loginTests = () => {
	it("Login with correct credentials", async () => {
		const res = await request("http://localhost:80")
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
		expect(res.statusCode).toBe(200)
		expect(res.body.data.login).toEqual(
			expect.objectContaining({
				email: testUser.email,
				name: testUser.name,
				id: expect.any(String),
				date_created: expect.any(Number),
			}),
		)
	})
	it("Login with INcorrect credentials", async () => {
		const res = await request("http://localhost:80")
			.post("/graphql")
			.withCredentials(true)
			.send({
				query: `
					mutation{
					login (data: {email: "${testUser.email + Math.random() * 1000}", password: "${
					testUser.password + Math.random() * 5000
				}" }) {
						id
						name
						email
						date_created
					}
				}
			`,
			})
		expect(res.statusCode).toBe(200)
		expect(res.body).toHaveProperty("errors")
		expect(res.body.errors.length).toBeGreaterThan(0)
	})
}
