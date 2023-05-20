"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const config_1 = __importDefault(require("./config"));
const clientOptions = {
    ssl: config_1.default.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
    connectionString: config_1.default.PG_STRING,
};
const client = new pg_1.Pool(clientOptions);
client.connect();
exports.default = client;
