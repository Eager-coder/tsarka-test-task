import { MiddlewareFn } from "type-graphql"
import ContextType from "../types/ContextType"
import { GraphQLError } from "graphql"
import jwt from "jsonwebtoken"
import config from "../config"

export const CheckAuth: MiddlewareFn<ContextType> = async ({ context }, next) => {
	try {
		const { access_token } = context.req.cookies
		if (!access_token) {
			throw new GraphQLError("Unauthorized", { extensions: { code: "FORBIDDEN" } })
		}
		const decoded = jwt.verify(access_token, config.JWT_ACCESS_SECRET!)

		if (typeof decoded === "object") {
			context.user.isAuthenticated = true
			context.user.id = decoded.id
		}

		return next()
	} catch (error) {
		throw new GraphQLError("Unauthorized", { extensions: { code: "FORBIDDEN" } })
	}
}
