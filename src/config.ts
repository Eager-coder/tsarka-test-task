import dotenv from "dotenv"
import findConfig from "find-config"

dotenv.config({ path: findConfig(".env")! })
export default {
	PORT: process.env.PORT,
	PG_STRING: process.env.PG_STRING,
	JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
	NODE_ENV: process.env.NODE_ENV,
}
