import { default as request } from "supertest"
import getUnixTimeNow from "../../src/helpers/getUnixTimeNow"
import User from "../../src/models/User"
import RefreshToken from "../../src/models/RefreshToken"
import { generateRefreshToken } from "../../src/helpers/generateTokens"

export const refreshTokenTestings = () => {
	it("Refresh tokens with valid refresh_token", async () => {
		const testUser1 = {
			id: "69f9a99e-da1e-46f4-bde4-d48cb3cdb787",
			name: "TestUser",
			email: `testuser69f9a99e-da1e-46f4-bde4-d48cb3cdb787@email.com`,
			password: "123456789",
			date_created: getUnixTimeNow(),
		}
		const refreshToken = generateRefreshToken()
		await User.add(testUser1)
		await RefreshToken.add({
			token: refreshToken,
			user_id: testUser1.id,
			expity_date: getUnixTimeNow() + 86400 * 14,
		})
		const res = await request("http://localhost:80")
			.post("/graphql")
			.set("Cookie", `refresh_token=${refreshToken}`)
			.withCredentials(true)
			.send({
				query: `
					mutation {
						refreshToken
					}
			`,
			})
		expect(res.statusCode).toBe(200)
		expect(res.body.data.refreshToken).toBeTruthy()
	})

	it("Forbid refresh tokens with invalid refresh_token", async () => {
		const testUser2 = {
			id: "1b839ec4-09e8-4950-b7de-5ebd7643c074",
			name: "TestUser",
			email: `testuser1b839ec4-09e8-4950-b7de-5ebd7643c074787@email.com`,
			password: "123456789",
			date_created: getUnixTimeNow(),
		}
		await User.add(testUser2)
		const refreshToken2 = generateRefreshToken()
		await RefreshToken.add({
			token: refreshToken2,
			user_id: testUser2.id,
			expity_date: getUnixTimeNow() + 86400 * 14,
		})

		const res = await request("http://localhost:80")
			.post("/graphql")
			.set("Cookie", `refresh_token=${refreshToken2 + Math.random() * 1000}`)
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
