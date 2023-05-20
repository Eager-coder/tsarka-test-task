"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const type_graphql_1 = require("type-graphql");
const Post_1 = __importDefault(require("../models/Post"));
const graphql_1 = require("graphql");
const crypto_1 = __importDefault(require("crypto"));
const checkAuth_1 = require("../middlewares/checkAuth");
let PostType = class PostType {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], PostType.prototype, "id", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], PostType.prototype, "header", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", String)
], PostType.prototype, "text", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", String)
], PostType.prototype, "image_url", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], PostType.prototype, "user_id", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", Date)
], PostType.prototype, "date", void 0);
PostType = __decorate([
    type_graphql_1.ObjectType()
], PostType);
let PostInput = class PostInput {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], PostInput.prototype, "header", void 0);
__decorate([
    type_graphql_1.Field(() => String, { nullable: true }),
    __metadata("design:type", String)
], PostInput.prototype, "image_url", void 0);
__decorate([
    type_graphql_1.Field(() => String, { nullable: true }),
    __metadata("design:type", String)
], PostInput.prototype, "text", void 0);
PostInput = __decorate([
    type_graphql_1.InputType()
], PostInput);
let PostResolver = class PostResolver {
    async getPost(id) {
        const post = await Post_1.default.getOne(id);
        if (!post) {
            throw new graphql_1.GraphQLError("Post not found");
        }
        return post;
    }
    async getPosts(page) {
        if (page <= 0) {
            throw new graphql_1.GraphQLError("Invalid page value", { extensions: { code: "BAD_USER_INPUT", argumentName: "page" } });
        }
        try {
            return await Post_1.default.getMany((page - 1) * 20, 20);
        }
        catch (error) {
            console.log(error);
            throw new graphql_1.GraphQLError("Something went wrong", {
                extensions: { code: "INTERNAL_SERVER_ERROR" },
            });
        }
    }
    async addPost({ header, image_url, text }, { user }) {
        if (!image_url && !text) {
            throw new graphql_1.GraphQLError("Either image_url or text must be provided");
        }
        const newPost = {
            id: crypto_1.default.randomUUID(),
            header,
            text: text || null,
            image_url: image_url || null,
            user_id: user.id,
            date: new Date().toISOString().split("T")[0],
        };
        const post = await Post_1.default.add(newPost);
        delete post.number;
        return post;
    }
};
__decorate([
    type_graphql_1.Query(() => PostType, { nullable: true }),
    __param(0, type_graphql_1.Arg("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "getPost", null);
__decorate([
    type_graphql_1.Query(() => [PostType], { nullable: true }),
    __param(0, type_graphql_1.Arg("page")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "getPosts", null);
__decorate([
    type_graphql_1.Mutation(() => PostType),
    type_graphql_1.UseMiddleware(checkAuth_1.CheckAuth),
    __param(0, type_graphql_1.Arg("post")),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [PostInput, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "addPost", null);
PostResolver = __decorate([
    type_graphql_1.Resolver()
], PostResolver);
exports.default = PostResolver;
