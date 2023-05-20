import jwt from "jsonwebtoken"
import crypto from "crypto"
import config from "../config"

export function generateAccessToken(id: string) {
	return jwt.sign({ id }, config.JWT_ACCESS_SECRET!, { expiresIn: 15 * 60 * 1000 })
}

export function generateRefreshToken() {
	return crypto.randomBytes(16).toString("hex")
}
