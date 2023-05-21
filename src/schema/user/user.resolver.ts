import { Arg, Ctx, Mutation, Query, Resolver, UseMiddleware } from "type-graphql"
import { LoginInput, RegisterInput } from "./user.input"
import { GraphQLError } from "graphql"
import User, { UserModel } from "../../models/User"
import crypto from "crypto"
import bcrypt from "bcrypt"
import { UserType } from "./user.type"
import ContextType from "../../types/ContextType"
import { generateAccessToken, generateRefreshToken } from "../../helpers/generateTokens"
import RefreshToken from "../../models/RefreshToken"
import getUnixTimeNow from "../../helpers/getUnixTimeNow"
import config from "../../config"
import { CheckAuth } from "../../middlewares/checkAuth"

@Resolver()
export class UserResolver {
	@Query(() => Boolean)
	test() {
		return true
	}
	@Mutation(() => Boolean)
	async register(@Arg("data") { password, email, name }: RegisterInput): Promise<Boolean> {
		if (!email.length) {
			throw new GraphQLError("Email cannot be empty", { extensions: { code: "BAD_USER_INPUT", argumentName: "email" } })
		}
		if (!name.length) {
			throw new GraphQLError("Name cannot be empty", { extensions: { code: "BAD_USER_INPUT", argumentName: "name" } })
		}
		if (password.length < 8) {
			throw new GraphQLError("Password length must be at least 8 characters", {
				extensions: { code: "BAD_USER_INPUT", argumentName: "password" },
			})
		}
		let user: UserModel | null = null
		try {
			user = await User.get(email)
		} catch (error) {
			throw new GraphQLError("Something went wrong", { extensions: { code: "INTERNAL_SERVER_ERROR" } })
		}
		if (user) {
			throw new GraphQLError("Email alreary taken", { extensions: { code: "BAD_USER_INPUT", argumentName: "email" } })
		}
		const newUser = {
			id: crypto.randomUUID(),
			name: name.trim(),
			email: email.trim(),
			password: await bcrypt.hash(password, 10),
			date_created: Math.floor(Date.now() / 1000),
		}
		try {
			await User.add(newUser)
			return true
		} catch (error) {
			throw new GraphQLError("Something went wrong", { extensions: { code: "INTERNAL_SERVER_ERROR" } })
		}
	}

	@Mutation(() => UserType)
	async login(@Arg("data") { email, password }: LoginInput, @Ctx() ctx: ContextType) {
		if (!email.length) {
			throw new GraphQLError("Email cannot be empty", {
				extensions: { code: "BAD_USER_INPUT", argumentName: "email" },
			})
		}
		if (!password.length) {
			throw new GraphQLError("Password cannot be empty", {
				extensions: { code: "BAD_USER_INPUT", argumentName: "password" },
			})
		}
		const user = await User.get(email)

		if (!user || !(await bcrypt.compare(password, user.password))) {
			throw new GraphQLError("Email or password is incorrect", { extensions: { code: "BAD_USER_INPUT" } })
		}

		const accessToken = generateAccessToken(user.id)
		const refreshToken = generateRefreshToken()
		await RefreshToken.add({ token: refreshToken, user_id: user.id, expity_date: getUnixTimeNow() + 86400 * 14 })
		ctx.res.cookie("access_token", accessToken, { maxAge: 15 * 60 * 1000, secure: config.NODE_ENV === "production" })
		ctx.res.cookie("refresh_token", refreshToken, {
			maxAge: 14 * 86400 * 1000,
			secure: config.NODE_ENV === "production",
		})
		delete user.password
		return user
	}

	@Mutation(() => Boolean)
	async refreshToken(@Ctx() { req, res }: ContextType) {
		const refresh_token = req.cookies.refresh_token
		const tokenObj = await RefreshToken.getByToken(refresh_token)
		if (!tokenObj) {
			throw new GraphQLError("Cannot refresh tokens, refresh_token not found", { extensions: { code: "FORBIDDEN" } })
		}
		if (tokenObj.expity_date < Math.floor(Date.now() / 1000)) {
			throw new GraphQLError("Cannot refresh tokens, refresh_token has expired", { extensions: { code: "FORBIDDEN" } })
		}
		const newRefreshToken = generateRefreshToken()
		const newAccessToken = generateAccessToken(tokenObj.user_id)
		await RefreshToken.delete(refresh_token)
		await RefreshToken.add({
			token: newRefreshToken,
			user_id: tokenObj.user_id,
			expity_date: getUnixTimeNow() + 86400 * 14,
		})
		res.cookie("refresh_token", newRefreshToken, {
			maxAge: 14 * 86400,
			secure: config.NODE_ENV === "production",
		})
		res.cookie("access_token", newAccessToken, {
			maxAge: 15 * 60,
			secure: config.NODE_ENV === "production",
		})
		return true
	}

	@Mutation(() => Boolean)
	@UseMiddleware(CheckAuth)
	async logout(@Ctx() ctx: ContextType) {
		const { refresh_token } = ctx.req.cookies
		await RefreshToken.delete(refresh_token)

		ctx.res.clearCookie("access_token")
		ctx.res.clearCookie("refresh_token")

		return true
	}
	catch() {
		throw new GraphQLError("Something went wrong", { extensions: { code: "INTERNAL_SERVER_ERROR" } })
	}
}
