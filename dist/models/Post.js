"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../db"));
class Post {
    async add({ id, header, text, image_url, user_id, date }) {
        const { rows } = await db_1.default.query("INSERT INTO posts (id, header, text, image_url, user_id, date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *", [id, header, text, image_url, user_id, date]);
        return rows[0];
    }
    async getOne(id) {
        const { rows } = await db_1.default.query("SELECT * FROM posts WHERE id = $1", [id]);
        return rows[0];
    }
    async getMany(offset, limit) {
        const { rows } = await db_1.default.query("SELECT * FROM posts ORDER BY date DESC LIMIT $1 OFFSET $2", [limit, offset]);
        return rows;
    }
    async update({ header, text, image_url, id }) {
        const { rows } = await db_1.default.query("UPDATE posts SET header = $1, text = $2, image_url = $3 WHERE id = $4", [
            header,
            text,
            image_url,
            id,
        ]);
        return rows[0];
    }
    async delete(id) {
        await db_1.default.query("DELETE FROM posts WHERE id = $1", [id]);
    }
}
exports.default = new Post();
