import { Pool, PoolConfig } from "pg"
import config from "./config"

const clientOptions: PoolConfig = {
	ssl: config.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
	connectionString: config.PG_STRING,
}

const pool = new Pool(clientOptions)
export default pool
