import { Arg, Ctx, Field, InputType, Mutation, ObjectType, Query, Resolver, UseMiddleware } from "type-graphql"
import Post from "../models/Post"
import { GraphQLError } from "graphql"
import crypto from "crypto"
import ContextType from "../types/ContextType"
import { CheckAuth } from "../middlewares/checkAuth"

@ObjectType()
class PostType {
	@Field()
	id!: string

	@Field()
	header!: string

	@Field({ nullable: true })
	text?: string

	@Field({ nullable: true })
	image_url?: string

	@Field()
	user_id!: string

	@Field()
	date!: Date
}

@InputType()
class PostInput {
	@Field()
	header!: string

	@Field(() => String, { nullable: true })
	image_url!: string

	@Field(() => String, { nullable: true })
	text!: string
}

@InputType()
class EditPostInput {
	@Field(() => String)
	id!: string

	@Field(() => String, { nullable: true })
	header?: string

	@Field(() => String, { nullable: true })
	image_url?: string

	@Field(() => String, { nullable: true })
	text?: string
}

@Resolver()
export default class PostResolver {
	@Query(() => PostType, { nullable: true })
	async getPost(@Arg("id") id: string) {
		const post = await Post.getOne(id)
		if (!post) {
			throw new GraphQLError("Post not found")
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
			throw new GraphQLError("Either image_url or text must be provided")
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
			throw new GraphQLError("Post not found")
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
			throw new GraphQLError("Post not found")
		}
		await Post.delete(id)

		return true
	}
}
