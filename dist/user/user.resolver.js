"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserResolver = void 0;
const type_graphql_1 = require("type-graphql");
const user_input_1 = require("./user.input");
const graphql_1 = require("graphql");
const User_1 = __importDefault(require("../models/User"));
const crypto_1 = __importDefault(require("crypto"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const user_type_1 = require("./user.type");
const generateTokens_1 = require("../helpers/generateTokens");
const RefreshToken_1 = __importDefault(require("../models/RefreshToken"));
const getUnixTimeNow_1 = __importDefault(require("../helpers/getUnixTimeNow"));
const config_1 = __importDefault(require("../config"));
const checkAuth_1 = require("../middlewares/checkAuth");
let UserResolver = class UserResolver {
    test() {
        return true;
    }
    async register({ password, email, name }) {
        if (!email.length) {
            throw new graphql_1.GraphQLError("Email cannot be empty", { extensions: { code: "BAD_USER_INPUT", argumentName: "email" } });
        }
        if (!name.length) {
            throw new graphql_1.GraphQLError("Name cannot be empty", { extensions: { code: "BAD_USER_INPUT", argumentName: "name" } });
        }
        if (password.length < 8) {
            throw new graphql_1.GraphQLError("Password length must be at least 8 characters", {
                extensions: { code: "BAD_USER_INPUT", argumentName: "password" },
            });
        }
        let user;
        try {
            user = await User_1.default.get(email);
        }
        catch (error) {
            throw new graphql_1.GraphQLError("Something went wrong", { extensions: { code: "INTERNAL_SERVER_ERROR" } });
        }
        if (user) {
            throw new graphql_1.GraphQLError("Email alreary taken", { extensions: { code: "BAD_USER_INPUT", argumentName: "email" } });
        }
        const newUser = {
            id: crypto_1.default.randomUUID(),
            name: name.trim(),
            email: email.trim(),
            password: await bcrypt_1.default.hash(password, 10),
            date_created: Math.floor(Date.now() / 1000),
        };
        try {
            await User_1.default.add(newUser);
            return true;
        }
        catch (error) {
            throw new graphql_1.GraphQLError("Something went wrong", { extensions: { code: "INTERNAL_SERVER_ERROR" } });
        }
    }
    async login({ email, password }, ctx) {
        if (!email.length) {
            throw new graphql_1.GraphQLError("Email cannot be empty", {
                extensions: { code: "BAD_USER_INPUT", argumentName: "email" },
            });
        }
        if (!password.length) {
            throw new graphql_1.GraphQLError("Password cannot be empty", {
                extensions: { code: "BAD_USER_INPUT", argumentName: "password" },
            });
        }
        const user = await User_1.default.get(email);
        if (!user || !(await bcrypt_1.default.compare(password, user.password))) {
            throw new graphql_1.GraphQLError("Email or password is incorrect", { extensions: { code: "BAD_USER_INPUT" } });
        }
        const accessToken = generateTokens_1.generateAccessToken(user.id);
        const refreshToken = generateTokens_1.generateRefreshToken();
        await RefreshToken_1.default.add({ token: refreshToken, user_id: user.id, expity_date: getUnixTimeNow_1.default() + 86400 * 14 });
        ctx.res.cookie("access_token", accessToken, { maxAge: 15 * 60 * 1000, secure: config_1.default.NODE_ENV === "production" });
        ctx.res.cookie("refresh_token", refreshToken, {
            maxAge: 14 * 86400 * 1000,
            secure: config_1.default.NODE_ENV === "production",
        });
        delete user.password;
        return user;
    }
    async refreshToken({ req, res }) {
        const refresh_token = req.cookies.refresh_token;
        const tokenObj = await RefreshToken_1.default.getByToken(refresh_token);
        if (!tokenObj) {
            throw new graphql_1.GraphQLError("Cannot refresh tokens, refresh_token not found", { extensions: { code: "FORBIDDEN" } });
        }
        if (tokenObj.expity_date < Math.floor(Date.now() / 1000)) {
            throw new graphql_1.GraphQLError("Cannot refresh tokens, refresh_token has expired", { extensions: { code: "FORBIDDEN" } });
        }
        const newRefreshToken = generateTokens_1.generateRefreshToken();
        const newAccessToken = generateTokens_1.generateAccessToken(tokenObj.user_id);
        await RefreshToken_1.default.delete(refresh_token);
        await RefreshToken_1.default.add({
            token: newRefreshToken,
            user_id: tokenObj.user_id,
            expity_date: getUnixTimeNow_1.default() + 86400 * 14,
        });
        res.cookie("refresh_token", newRefreshToken, {
            maxAge: 14 * 86400,
            secure: config_1.default.NODE_ENV === "production",
        });
        res.cookie("access_token", newAccessToken, {
            maxAge: 15 * 60,
            secure: config_1.default.NODE_ENV === "production",
        });
        return true;
    }
    async logout(ctx) {
        const { refresh_token } = ctx.req.cookies;
        await RefreshToken_1.default.delete(refresh_token);
        ctx.res.clearCookie("access_token");
        ctx.res.clearCookie("refresh_token");
        return true;
    }
    catch() {
        throw new graphql_1.GraphQLError("Something went wrong", { extensions: { code: "INTERNAL_SERVER_ERROR" } });
    }
};
__decorate([
    type_graphql_1.Query(() => Boolean),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], UserResolver.prototype, "test", null);
__decorate([
    type_graphql_1.Mutation(() => Boolean),
    __param(0, type_graphql_1.Arg("data")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_input_1.RegisterInput]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "register", null);
__decorate([
    type_graphql_1.Mutation(() => user_type_1.UserType),
    __param(0, type_graphql_1.Arg("data")),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_input_1.LoginInput, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "login", null);
__decorate([
    type_graphql_1.Mutation(() => Boolean),
    __param(0, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "refreshToken", null);
__decorate([
    type_graphql_1.Mutation(() => Boolean),
    type_graphql_1.UseMiddleware(checkAuth_1.CheckAuth),
    __param(0, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "logout", null);
UserResolver = __decorate([
    type_graphql_1.Resolver()
], UserResolver);
exports.UserResolver = UserResolver;
