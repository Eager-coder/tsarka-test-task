"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckAuth = void 0;
const graphql_1 = require("graphql");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../config"));
const CheckAuth = async ({ context }, next) => {
    try {
        const { access_token } = context.req.cookies;
        if (!access_token) {
            throw new graphql_1.GraphQLError("Unauthorized");
        }
        const decoded = jsonwebtoken_1.default.verify(access_token, config_1.default.JWT_ACCESS_SECRET);
        if (typeof decoded === "object") {
            context.user.isAuthenticated = true;
            context.user.id = decoded.id;
        }
        return next();
    }
    catch (error) {
        throw new graphql_1.GraphQLError("Unauthorized");
    }
};
exports.CheckAuth = CheckAuth;
