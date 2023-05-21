import db from "../db"

export interface UserModel {
	id: string
	name: string
	email: string
	password: string
	date_created: number
}

class User {
	async add({ id, name, email, password, date_created }: UserModel): Promise<UserModel | null> {
		const { rows } = await db.query(
			"INSERT INTO users (id, name, email, password, date_created)  VALUES ($1, $2, $3, $4, $5) RETURNING *",
			[id, name, email, password, date_created],
		)
		return rows[0]
	}
	async get(email: string): Promise<UserModel | null> {
		const res = await db.query("SELECT * FROM users WHERE email = $1", [email])
		return res.rows[0]
	}
	async delete(id: string): Promise<void> {
		await db.query("DELETE FROM users WHERE id = $1", [id])
	}
}

export default new User()
