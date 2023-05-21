import { Arg, Ctx, Mutation, Query, Resolver, UseMiddleware } from "type-graphql"
import { PostType } from "./post.type"
import { GraphQLError } from "graphql"
import Post from "../../models/Post"
import { CheckAuth } from "../../middlewares/checkAuth"
import { EditPostInput, PostInput } from "./post.input"
import ContextType from "../../types/ContextType"
import crypto from "crypto"

@Resolver()
export class PostResolver {
	@Query(() => PostType, { nullable: true })
	async getPost(@Arg("id") id: string) {
		const post = await Post.getOne(id)
		if (!post) {
			throw new GraphQLError("Post not found", { extensions: { code: "NOT_FOUND" } })
		}
		return post
	}

	@Query(() => [PostType], { nullable: true })
	async getPosts(@Arg("page") page: number) {
		if (page <= 0) {
			throw new GraphQLError("Invalid page value", { extensions: { code: "BAD_USER_INPUT", argumentName: "page" } })
		}

		try {
			return await Post.getMany((page - 1) * 20, 20)
		} catch (error) {
			console.log(error)

			throw new GraphQLError("Something went wrong", {
				extensions: { code: "INTERNAL_SERVER_ERROR" },
			})
		}
	}

	@Mutation(() => PostType)
	@UseMiddleware(CheckAuth)
	async addPost(@Arg("post") { header, image_url, text }: PostInput, @Ctx() { user }: ContextType) {
		if (!image_url && !text) {
			throw new GraphQLError("Either image_url or text must be provided", {
				extensions: { code: "BAD_USER_INPUT" },
			})
		}
		const newPost = {
			id: crypto.randomUUID(),
			header,
			text: text || null,
			image_url: image_url || null,
			user_id: user.id!,
			date: new Date().toISOString().split("T")[0],
		}

		const post = await Post.add(newPost)
		delete post.number
		return post
	}

	@Mutation(() => PostType)
	@UseMiddleware(CheckAuth)
	async editPost(@Arg("post") { id, header, image_url, text }: EditPostInput, @Ctx() { user }: ContextType) {
		const oldPost = await Post.getOne(id)
		if (!id || !oldPost || oldPost.user_id != user.id) {
			throw new GraphQLError("Post not found", { extensions: { code: "NOT_FOUND" } })
		}

		const editedPost = {
			...oldPost,
			header: header || oldPost.header,
			text: text || oldPost.text,
			image_url: image_url || oldPost.image_url,
		}

		await Post.update(editedPost)
		return editedPost
	}

	@Mutation(() => Boolean)
	@UseMiddleware(CheckAuth)
	async deletePost(@Arg("id") id: string, @Ctx() { user }: ContextType) {
		const post = await Post.getOne(id)

		if (!post || post.user_id != user.id) {
			throw new GraphQLError("Post not found", { extensions: { code: "NOT_FOUND" } })
		}
		await Post.delete(id)

		return true
	}
}
