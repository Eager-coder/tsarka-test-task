import { Field, InputType } from "type-graphql"

@InputType()
export class EditPostInput {
	@Field(() => String)
	id!: string

	@Field(() => String, { nullable: true })
	header?: string

	@Field(() => String, { nullable: true })
	image_url?: string

	@Field(() => String, { nullable: true })
	text?: string
}

@InputType()
export class PostInput {
	@Field()
	header!: string

	@Field(() => String, { nullable: true })
	image_url!: string

	@Field(() => String, { nullable: true })
	text!: string
}
