import db from "../db"

interface RToken {
	token: string
	user_id: string
	expity_date: number
}

class RefreshToken {
	async add({ token, user_id, expity_date }: RToken) {
		await db.query("INSERT INTO refresh_tokens (user_id, token, expiry_date) VALUES ($1, $2, $3) ", [
			user_id,
			token,
			expity_date,
		])
	}
	async get(user_id: string): Promise<RToken | null> {
		const { rows } = await db.query("SELECT * FROM refresh_tokens WHERE user_id = $1", [user_id])
		return rows[0]
	}
	async getByToken(token: string): Promise<RToken | null> {
		const { rows } = await db.query("SELECT * FROM refresh_tokens WHERE token = $1", [token])
		return rows[0]
	}
	async delete(token: string) {
		await db.query("DELETE FROM refresh_tokens WHERE token = $1", [token])
	}
}

export default new RefreshToken()
