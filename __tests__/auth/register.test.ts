import { default as request } from "supertest"

export const testUser = {
	name: "Egor",
	email: "myemail@email.com",
	password: "123456789",
}

export const registerTests = () => {
	it("Allow register with valid credentials", async () => {
		const res = await request("http://localhost:80")
			.post("/graphql")
			.send({
				query: `
				mutation{
					register(data: {email: "${testUser.email}", password:"${testUser.password}", name:"${testUser.name}"})
				}
			`,
			})
		expect(res.body.data?.register).toEqual("Successfully registered")
	})

	it("Do not allow register with Existing email", async () => {
		const res = await request("http://localhost:80")
			.post("/graphql")
			.send({
				query: `
				mutation{
					register(data: {email: "${testUser.email}", password:"${testUser.password}", name:"${testUser.name}"})
				}
			`,
			})
		expect(res.body).toHaveProperty("errors")
		expect(res.body.errors.length).toBeGreaterThan(0)
	})
	it("Do not allow register with INvalid password", async () => {
		const res = await request("http://localhost:80")
			.post("/graphql")
			.send({
				query: `
				mutation{
					register(data: {email: "${testUser.email + Math.random() * 100}", password:"", name:"${testUser.name}"})
				}
			`,
			})
		expect(res.body).toHaveProperty("errors")
		expect(res.body.errors.length).toBeGreaterThan(0)
	})
}
