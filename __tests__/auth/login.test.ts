import { default as request } from "supertest"
import User from "../../src/models/User"
import getUnixTimeNow from "../../src/helpers/getUnixTimeNow"
import bcrypt from "bcrypt"

export const loginTests = () => {
	it("Allow login with correct credentials", async () => {
		const password = "123456789"
		const hashedPassword = await bcrypt.hash(password, 10)

		const loginTestUser = {
			id: "f0563376-29b8-49dd-afb3-9a83a2dd5c62",
			name: "TestUser",
			email: `testuserf0563376-29b8-49dd-afb3-9a83a2dd5c62@email.com`,
			date_created: getUnixTimeNow(),
		}

		await User.add({ ...loginTestUser, password: hashedPassword })
		const res = await request("http://localhost:80")
			.post("/graphql")
			.withCredentials(true)
			.send({
				query: `
					mutation{
					login (data: {email: "${loginTestUser.email}", password: "${password}" }) {
						id
						name
						email
						date_created
					}
				}
			`,
			})
		expect(res.body).toHaveProperty("data")
		expect(res.body.data.login).toEqual(expect.objectContaining(loginTestUser))
	})

	it("Forbid login with non-existing email", async () => {
		const password = "123456789"
		const hashedPassword = await bcrypt.hash(password, 10)

		const loginTestUser2 = {
			id: "f0563376-29b8-49dd-afb3-9a83a2dd5c62",
			name: "TestUser",
			email: `testuserf0563376-29b8-49dd-afb3-9a83a2dd5c62@email.com`,
			date_created: getUnixTimeNow(),
		}

		await User.add({ ...loginTestUser2, password: hashedPassword })
		const res = await request("http://localhost:80")
			.post("/graphql")
			.withCredentials(true)
			.send({
				query: `
					mutation{
					login (data: {email: "${loginTestUser2.email + Math.random() * 1000}", password: "${password}" }) {
						id
						name
						email
						date_created
					}
				}
			`,
			})
		expect(res.body).toHaveProperty("errors")
		expect(res.body.errors.length).toBeGreaterThan(0)
		expect(res.body.errors[0].extensions.code).toBe("BAD_USER_INPUT")
	})
	it("Forbid login with incorrect password", async () => {
		const password = "123456789"
		const hashedPassword = await bcrypt.hash(password, 10)

		const loginTestUser3 = {
			id: "bd8bca6e-8760-46a2-a424-f58e665bd9c4",
			name: "TestUser",
			email: `testuserbd8bca6e-8760-46a2-a424-f58e665bd9c462@email.com`,
			date_created: getUnixTimeNow(),
		}

		await User.add({ ...loginTestUser3, password: hashedPassword })
		const res = await request("http://localhost:80")
			.post("/graphql")
			.withCredentials(true)
			.send({
				query: `
					mutation{
					login (data: {email: "${loginTestUser3.email + Math.random()}", password: "${password + Math.random() * 1000}" }) {
						id
						name
						email
						date_created
					}
				}
			`,
			})
		expect(res.body).toHaveProperty("errors")
		expect(res.body.errors.length).toBeGreaterThan(0)
		expect(res.body.errors[0].extensions.code).toBe("BAD_USER_INPUT")
	})
}
