import db from "../db"

export interface PostModel {
	id: string
	header: string
	text: string | null
	image_url: string | null
	user_id: string
	date: string
	number?: number
}

class Post {
	async add({ id, header, text, image_url, user_id, date }: PostModel): Promise<PostModel> {
		const { rows } = await db.query(
			"INSERT INTO posts (id, header, text, image_url, user_id, date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
			[id, header, text, image_url, user_id, date],
		)
		return rows[0]
	}
	async getOne(id: string): Promise<PostModel | null> {
		const { rows } = await db.query("SELECT * FROM posts WHERE id = $1", [id])
		return rows[0]
	}
	async getMany(offset: number, limit: number) {
		const { rows } = await db.query("SELECT * FROM posts ORDER BY date DESC LIMIT $1 OFFSET $2", [limit, offset])

		return rows
	}
	async update({ header, text, image_url, id }: PostModel): Promise<PostModel> {
		const { rows } = await db.query("UPDATE posts SET header = $1, text = $2, image_url = $3 WHERE id = $4", [
			header,
			text,
			image_url,
			id,
		])
		return rows[0]
	}
	async delete(id: string) {
		await db.query("DELETE FROM posts WHERE id = $1", [id])
	}
}

export default new Post()
