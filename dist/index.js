"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeServer = exports.main = void 0;
require("reflect-metadata");
const server_1 = require("@apollo/server");
const express4_1 = require("@apollo/server/express4");
const drainHttpServer_1 = require("@apollo/server/plugin/drainHttpServer");
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const body_parser_1 = __importDefault(require("body-parser"));
const config_1 = __importDefault(require("./config"));
const type_graphql_1 = require("type-graphql");
const user_resolver_1 = require("./user/user.resolver");
const post_resolver_1 = require("./post/post.resolver");
const app = express_1.default();
const httpServer = http_1.default.createServer(app);
async function main() {
    const schema = await type_graphql_1.buildSchema({
        resolvers: [user_resolver_1.UserResolver, post_resolver_1.PostResolver],
        validate: false,
        dateScalarMode: "isoDate",
    });
    const server = new server_1.ApolloServer({
        schema,
        plugins: [drainHttpServer_1.ApolloServerPluginDrainHttpServer({ httpServer })],
    });
    await server.start();
    app.use(cookie_parser_1.default(), cors_1.default({ credentials: true, origin: ["https://studio.apollographql.com", "http://localhost:4000"] }), body_parser_1.default.json(), express4_1.expressMiddleware(server, {
        context: async ({ req, res }) => {
            return {
                req,
                res,
                user: {
                    isAuthenticated: false,
                    id: null,
                },
            };
        },
    }));
    httpServer.listen({ port: config_1.default.PORT });
    console.log(`Server ready at http://localhost:${config_1.default.PORT}`);
}
exports.main = main;
function closeServer() {
    httpServer.close();
}
exports.closeServer = closeServer;
main();
