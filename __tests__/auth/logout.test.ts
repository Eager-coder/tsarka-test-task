import { default as request } from "supertest"
import User from "../../src/models/User"
import getUnixTimeNow from "../../src/helpers/getUnixTimeNow"
import { generateAccessToken } from "../../src/helpers/generateTokens"

export const logoutTests = () => {
	it("Allow logout for authorized client", async () => {
		const testUser = {
			id: "2a512260-78db-488a-ae55-1a2c9c8f077c",
			name: "TestUser",
			email: `testuser2a512260-78db-488a-ae55-1a2c9c8f077c@email.com`,
			password: "123456789",
			date_created: getUnixTimeNow(),
		}
		await User.add(testUser)
		const accessToken = generateAccessToken(testUser.id)

		const res = await request("http://localhost:80")
			.post("/graphql")
			.set("Cookie", `access_token=${accessToken}`)
			.withCredentials(true)
			.send({
				query: `
					mutation {
						logout
					}
			`,
			})
		expect(res.statusCode).toBe(200)
		expect(res.body.data.logout).toBeTruthy()
	})
	it("Forbid logout for unauthorized client", async () => {
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
		expect(res.body.errors[0].extensions.code).toBe("FORBIDDEN")
	})
}
