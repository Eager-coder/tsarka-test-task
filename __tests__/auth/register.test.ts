import { default as request } from "supertest"
import User, { UserModel } from "../../src/models/User"
import getUnixTimeNow from "../../src/helpers/getUnixTimeNow"
import crypto from "crypto"

export const registerTests = () => {
	it("Allow register with valid credentials", async () => {
		const testUser1: UserModel = {
			id: "0f2c0f20-d500-4f6c-a168-dbc3222724f3",
			name: "TestUser",
			email: `testuser${getUnixTimeNow()}@email.com`,
			password: "123456789",
			date_created: getUnixTimeNow(),
		}

		const res = await request("http://localhost:80")
			.post("/graphql")
			.send({
				query: `
				mutation{
					register(data: {email: "${testUser1.email}", password:"${testUser1.password}", name:"${testUser1.name}"})
				}
			`,
			})
		expect(res.body.data?.register).toBeTruthy()
	})

	it("Forbid register with existing email", async () => {
		const testUser2: UserModel = {
			id: "e02573d1-012b-426d-8e02-76938b8c4fec",
			name: "TestUser",
			email: `testusere02573d1-012b-426d-8e02-76938b8c4fec@email.com`,
			password: "123456789",
			date_created: getUnixTimeNow(),
		}
		await User.add(testUser2)
		const res = await request("http://localhost:80")
			.post("/graphql")
			.send({
				query: `
				mutation{
					register(data: {email: "${testUser2.email}", password:"${testUser2.password}", name:"${testUser2.name}"})
				}
			`,
			})
		expect(res.body).toHaveProperty("errors")
		expect(res.body.errors.length).toBeGreaterThan(0)
	})

	it("Forbid register with invalid password", async () => {
		const testUser3: UserModel = {
			id: "21a80c4b-3d7a-49da-be72-db37b255f96a",
			name: "TestUser",
			email: `testuser21a80c4b-3d7a-49da-be72-db37b255f96a@email.com`,
			password: "123456789",
			date_created: getUnixTimeNow(),
		}
		const res = await request("http://localhost:80")
			.post("/graphql")
			.send({
				query: `
				mutation{
					register(data: {email: "${testUser3.email + Math.random() * 100}", password:"${123}", name:"${testUser3.name}"})
				}
			`,
			})
		expect(res.body).toHaveProperty("errors")
		expect(res.body.errors.length).toBeGreaterThan(0)
	})

	it("Forbid register with empty credentials", async () => {
		const res = await request("http://localhost:80")
			.post("/graphql")
			.send({
				query: `
				mutation{
					register(data: {email: "", password:"", name:""})
				}
			`,
			})
		expect(res.body).toHaveProperty("errors")
		expect(res.body.errors.length).toBeGreaterThan(0)
	})
}
