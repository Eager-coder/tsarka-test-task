"use strict"
var __decorate =
	(this && this.__decorate) ||
	function (decorators, target, key, desc) {
		var c = arguments.length,
			r = c < 3 ? target : desc === null ? (desc = Object.getOwnPropertyDescriptor(target, key)) : desc,
			d
		if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
			r = Reflect.decorate(decorators, target, key, desc)
		else
			for (var i = decorators.length - 1; i >= 0; i--)
				if ((d = decorators[i])) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r
		return c > 3 && r && Object.defineProperty(target, key, r), r
	}
var __metadata =
	(this && this.__metadata) ||
	function (k, v) {
		if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v)
	}
var __param =
	(this && this.__param) ||
	function (paramIndex, decorator) {
		return function (target, key) {
			decorator(target, key, paramIndex)
		}
	}
var __importDefault =
	(this && this.__importDefault) ||
	function (mod) {
		return mod && mod.__esModule ? mod : { default: mod }
	}
Object.defineProperty(exports, "__esModule", { value: true })
exports.PostResolver = void 0
const type_graphql_1 = require("type-graphql")
const post_type_1 = require("./post.type")
const graphql_1 = require("graphql")
const Post_1 = __importDefault(require("../models/Post"))
const checkAuth_1 = require("../middlewares/checkAuth")
const post_input_1 = require("./post.input")
const crypto_1 = __importDefault(require("crypto"))
let PostResolver = class PostResolver {
	async getPost(id) {
		const post = await Post_1.default.getOne(id)
		if (!post) {
			throw new graphql_1.GraphQLError("Post not found", { extensions: { code: "NOT_FOUND" } })
		}
		return post
	}
	async getPosts(page) {
		if (page <= 0) {
			throw new graphql_1.GraphQLError("Invalid page value", {
				extensions: { code: "BAD_USER_INPUT", argumentName: "page" },
			})
		}
		try {
			return await Post_1.default.getMany((page - 1) * 20, 20)
		} catch (error) {
			console.log(error)
			throw new graphql_1.GraphQLError("Something went wrong", {
				extensions: { code: "INTERNAL_SERVER_ERROR" },
			})
		}
	}
	async addPost({ header, image_url, text }, { user }) {
		if (!image_url && !text) {
			throw new graphql_1.GraphQLError("Either image_url or text must be provided", {
				extensions: { code: "BAD_USER_INPUT" },
			})
		}
		const newPost = {
			id: crypto_1.default.randomUUID(),
			header,
			text: text || null,
			image_url: image_url || null,
			user_id: user.id,
			date: new Date().toISOString(),
		}
		const post = await Post_1.default.add(newPost)
		delete post.number
		return post
	}
	async editPost({ id, header, image_url, text }, { user }) {
		const oldPost = await Post_1.default.getOne(id)
		if (!id || !oldPost || oldPost.user_id != user.id) {
			throw new graphql_1.GraphQLError("Post not found", { extensions: { code: "NOT_FOUND" } })
		}
		const editedPost = {
			...oldPost,
			header: header || oldPost.header,
			text: text || oldPost.text,
			image_url: image_url || oldPost.image_url,
		}
		await Post_1.default.update(editedPost)
		return editedPost
	}
	async deletePost(id, { user }) {
		const post = await Post_1.default.getOne(id)
		if (!post || post.user_id != user.id) {
			throw new graphql_1.GraphQLError("Post not found", { extensions: { code: "NOT_FOUND" } })
		}
		await Post_1.default.delete(id)
		return true
	}
}
__decorate(
	[
		type_graphql_1.Query(() => post_type_1.PostType, { nullable: true }),
		__param(0, type_graphql_1.Arg("id")),
		__metadata("design:type", Function),
		__metadata("design:paramtypes", [String]),
		__metadata("design:returntype", Promise),
	],
	PostResolver.prototype,
	"getPost",
	null,
)
__decorate(
	[
		type_graphql_1.Query(() => [post_type_1.PostType], { nullable: true }),
		__param(0, type_graphql_1.Arg("page")),
		__metadata("design:type", Function),
		__metadata("design:paramtypes", [Number]),
		__metadata("design:returntype", Promise),
	],
	PostResolver.prototype,
	"getPosts",
	null,
)
__decorate(
	[
		type_graphql_1.Mutation(() => post_type_1.PostType),
		type_graphql_1.UseMiddleware(checkAuth_1.CheckAuth),
		__param(0, type_graphql_1.Arg("post")),
		__param(1, type_graphql_1.Ctx()),
		__metadata("design:type", Function),
		__metadata("design:paramtypes", [post_input_1.PostInput, Object]),
		__metadata("design:returntype", Promise),
	],
	PostResolver.prototype,
	"addPost",
	null,
)
__decorate(
	[
		type_graphql_1.Mutation(() => post_type_1.PostType),
		type_graphql_1.UseMiddleware(checkAuth_1.CheckAuth),
		__param(0, type_graphql_1.Arg("post")),
		__param(1, type_graphql_1.Ctx()),
		__metadata("design:type", Function),
		__metadata("design:paramtypes", [post_input_1.EditPostInput, Object]),
		__metadata("design:returntype", Promise),
	],
	PostResolver.prototype,
	"editPost",
	null,
)
__decorate(
	[
		type_graphql_1.Mutation(() => Boolean),
		type_graphql_1.UseMiddleware(checkAuth_1.CheckAuth),
		__param(0, type_graphql_1.Arg("id")),
		__param(1, type_graphql_1.Ctx()),
		__metadata("design:type", Function),
		__metadata("design:paramtypes", [String, Object]),
		__metadata("design:returntype", Promise),
	],
	PostResolver.prototype,
	"deletePost",
	null,
)
PostResolver = __decorate([type_graphql_1.Resolver()], PostResolver)
exports.PostResolver = PostResolver
