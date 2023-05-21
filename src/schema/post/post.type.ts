import { Field, ObjectType } from "type-graphql"

@ObjectType()
export class PostType {
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
