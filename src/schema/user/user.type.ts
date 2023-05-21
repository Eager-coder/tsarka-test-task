import { Field, ObjectType } from "type-graphql"

@ObjectType()
export class UserType {
	@Field()
	id!: string

	@Field()
	name!: string

	@Field()
	email!: string

	@Field()
	date_created!: number
}
