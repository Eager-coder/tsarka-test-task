"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../db"));
class RefreshToken {
    async add({ token, user_id, expity_date }) {
        await db_1.default.query("INSERT INTO refresh_tokens (user_id, token, expiry_date) VALUES ($1, $2, $3) ", [
            user_id,
            token,
            expity_date,
        ]);
    }
    async get(user_id) {
        const { rows } = await db_1.default.query("SELECT * FROM refresh_tokens WHERE user_id = $1", [user_id]);
        return rows[0];
    }
    async getByToken(token) {
        const { rows } = await db_1.default.query("SELECT * FROM refresh_tokens WHERE token = $1", [token]);
        return rows[0];
    }
    async delete(token) {
        await db_1.default.query("DELETE FROM refresh_tokens WHERE token = $1", [token]);
    }
}
exports.default = new RefreshToken();
