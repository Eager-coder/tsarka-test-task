"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const find_config_1 = __importDefault(require("find-config"));
dotenv_1.default.config({ path: find_config_1.default(".env") });
exports.default = {
    PORT: process.env.PORT,
    PG_STRING: process.env.PG_STRING,
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
    NODE_ENV: process.env.NODE_ENV,
};
