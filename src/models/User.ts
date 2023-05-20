import db from "../db"

interface UserData {
	id: string
	name: string
	email: string
	password: string
	date_created: number
}

class User {
	async add({ id, name, email, password, date_created }: UserData): Promise<UserData | null> {
		const { rows } = await db.query(
			"INSERT INTO users (id, name, email, password, date_created)  VALUES ($1, $2, $3, $4, $5) RETURNING *",
			[id, name, email, password, date_created],
		)
		return rows[0]
	}
	async get(email: string): Promise<UserData | null> {
		const res = await db.query("SELECT * FROM users WHERE email = $1", [email])
		return res.rows[0]
	}
}

export default new User()
