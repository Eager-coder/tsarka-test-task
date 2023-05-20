"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../db"));
class User {
    async add({ id, name, email, password, date_created }) {
        const { rows } = await db_1.default.query("INSERT INTO users (id, name, email, password, date_created)  VALUES ($1, $2, $3, $4, $5) RETURNING *", [id, name, email, password, date_created]);
        return rows[0];
    }
    async get(email) {
        const res = await db_1.default.query("SELECT * FROM users WHERE email = $1", [email]);
        return res.rows[0];
    }
}
exports.default = new User();
