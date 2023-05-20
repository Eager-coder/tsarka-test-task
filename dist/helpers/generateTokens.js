"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRefreshToken = exports.generateAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const config_1 = __importDefault(require("../config"));
function generateAccessToken(id) {
    return jsonwebtoken_1.default.sign({ id }, config_1.default.JWT_ACCESS_SECRET, { expiresIn: 15 * 60 * 1000 });
}
exports.generateAccessToken = generateAccessToken;
function generateRefreshToken() {
    return crypto_1.default.randomBytes(16).toString("hex");
}
exports.generateRefreshToken = generateRefreshToken;
