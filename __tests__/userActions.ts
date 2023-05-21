import getUnixTimeNow from "../src/helpers/getUnixTimeNow"
import User, { UserModel } from "../src/models/User"
import crypto from "crypto"

export const testUser: UserModel = {
	id: "f2f3fbae-bba5-4ac0-8e80-1535d62fecdb",
	name: "TestUser",
	email: "testuser@email.com",
	password: "123456789",
	date_created: getUnixTimeNow(),
}

export const createTestUser = async () => {
	await User.add(testUser)
}

export const deleteTestUser = async () => {
	await User.delete(testUser.id)
}
