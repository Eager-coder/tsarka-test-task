import "reflect-metadata"
import { ApolloServer } from "@apollo/server"
import { expressMiddleware } from "@apollo/server/express4"
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer"
import express, { Request, Response } from "express"
import http from "http"
import cors from "cors"
import cookieParser from "cookie-parser"
import bodyParser from "body-parser"
import config from "../src/config"
import { buildSchema } from "type-graphql"
import ContextType from "../src/types/ContextType"
import { UserResolver } from "../src/schema/user/user.resolver"
import { PostResolver } from "../src/schema/post/post.resolver"

const app = express()
const httpServer = http.createServer(app)

export async function main() {
	const schema = await buildSchema({
		resolvers: [UserResolver, PostResolver],
		validate: false,
		dateScalarMode: "isoDate",
	})
	const server = new ApolloServer({
		schema,
		plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
	})
	await server.start()
	app.use(
		cookieParser(),
		cors({ credentials: true, origin: ["https://studio.apollographql.com", "http://localhost:4000"] }),
		bodyParser.json(),
		expressMiddleware(server, {
			context: async ({ req, res }: { req: Request; res: Response }): Promise<ContextType> => {
				return {
					req,
					res,
					user: {
						isAuthenticated: false,
						id: null,
					},
				}
			},
		}),
	)

	httpServer.listen({ port: config.PORT })
	console.log(`Server ready at http://localhost:${config.PORT}`)
}
export function closeServer() {
	httpServer.close()
}
