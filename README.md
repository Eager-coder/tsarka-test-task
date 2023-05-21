# TSARKA GraphQL test assignment

A test server built using Express, TypeGraphQL, and PostgreSQL 

## Instructions on how to run the server

1. Create a Posgres database with the following tables:

```sql
CREATE TABLE "public"."users" (
    "id" uuid NOT NULL,
    "email" varchar NOT NULL,
    "name" varchar NOT NULL,
    "password" varchar NOT NULL,
    "date_created" int4 NOT NULL,
    PRIMARY KEY ("id")
);

CREATE TABLE "public"."refresh_tokens" (
    "user_id" uuid NOT NULL,
    "token" varchar NOT NULL,
    "expiry_date" int4 NOT NULL,
    FOREIGN KEY ("user_id") REFERENCES "public"."users"("id"),
    PRIMARY KEY ("user_id","token")
);

CREATE TABLE "public"."posts" (
    "id" uuid NOT NULL,
    "header" varchar NOT NULL,
    "text" text,
    "image_url" varchar,
    "user_id" uuid NOT NULL,
    "date" timestamptz NOT NULL DEFAULT CURRENT_DATE,
    "number" SERIAL,
    FOREIGN KEY ("user_id") REFERENCES "public"."users"("id"),
    PRIMARY KEY ("id")
);
```

2. Create a ```.env``` file and add the necessary credentials:

```
PORT=<port>
PG_STRING=<postgres-connection-string>
JWT_ACCESS_SECRET=<jwt-access-token-secret>
```

3. Install dependencies, compile, and run:
  
```bash
yarn install
yarn run build
yarn run start
```
## Testing

Testing is built using Jest. Be aware that after each test, the tables are truncated. 

### To run tests:

```bash
yarn test
```
## API Docimentation
### Queries
#### 1. Test query:
```graphql
query Test {
    test
}
```
Response:
```graphql
{
  "data": {
    "test": true
  }
}
```
#### 2. Get posts:
```graphql
query GetPosts {
    getPosts(page: 1) {
        id
        header
        text
        image_url
        user_id
        date
    }
}
```
Response:
```graphql
{
    "data": {
        "getPosts": [
            {
                "id": "d46198f6-0a93-4078-b075-e3433410f91f",
                "header": "Edited header",
                "text": "Edited text",
                "image_url": "https://imageurl.com/image.png",
                "user_id": "43daca24-a44b-4586-a896-371769b9e2e2",
                "date": "2023-05-21T22:40:45.345Z"
            }
        ]
    }
}
```
#### 3. Get a post by ID:
```graphql
query GetPost {
    getPost(id: "d46198f6-0a93-4078-b075-e3433410f91f") {
        id
        header
        text
        image_url
        user_id
        date
    }
}
```
Response:
```graphql
{
    "data": {
        "getPost": {
            "id": "d46198f6-0a93-4078-b075-e3433410f91f",
            "header": "Edited header",
            "text": "Edited text",
            "image_url": "https://imageurl.com/image.png",
            "user_id": "43daca24-a44b-4586-a896-371769b9e2e2",
            "date": "2023-05-21T22:40:45.345Z"
        }
    }
}
```

### Mutations
#### 1. Register:
```graphql
mutation Register {
  register(
    data: {name: "TestName", email: "testemail@mail.com", password: "123456789"}
  )
}
```
Response:
```graphql
{
    "data": {
        "register": true
    }
}
```
#### 2. Login:
```graphql
mutation Login {
    login(data: {email: "testemail@mail.com", password: "123456789"}) {
        id
        name
        email
        date_created
    }
}
 
 ```
 Response:
```graphql
{
    "data": {
        "login": {
            "id": "43daca24-a44b-4586-a896-371769b9e2e2",
            "name": "TestName",
            "email": "testemail@mail.com",
            "date_created": 1684707874
        }
    }
}
```
#### 3. Refresh token:
```graphql
mutation RefreshToken {
    refreshToken
}
```
Response:
```graphql
{
    "data": {
        "refreshToken": true
    }
}
```
#### 4. Logout:

```graphql
mutation Logout {
    logout
}
```
Response:
```graphql
{
    "data": {
        "logout": true
    }
}
```

#### 5. Add a post:
```graphql
mutation AddPost{
    addPost(
        post: {header: "This is header", image_url: "https://imageurl.com/image.png", text: "This is post paragraph"}
    ) {
        id
        header
        text
        image_url
        user_id
        date
    }
}
```
Response:
```graphql
{
    "data": {
        "addPost": {
            "id": "d46198f6-0a93-4078-b075-e3433410f91f",
            "header": "This is header",
            "text": "This is post paragraph",
            "image_url": "https://imageurl.com/image.png",
            "user_id": "43daca24-a44b-4586-a896-371769b9e2e2",
            "date": "2023-05-21T22:40:45.345Z"
        }
    }
}
```
#### 6. Edit a post:
```graphql
mutation EditPost {
    editPost(
        post: {id: "d46198f6-0a93-4078-b075-e3433410f91f", header: "Edited header", text: "Edited text"}
    ) {
        id
        header
        text
        image_url
        user_id
        date
    }
}
```
Response:
```graphql
{
    "data": {
        "editPost": {
            "id": "d46198f6-0a93-4078-b075-e3433410f91f",
            "header": "Edited header",
            "text": "Edited text",
            "image_url": "https://imageurl.com/image.png",
            "user_id": "43daca24-a44b-4586-a896-371769b9e2e2",
            "date": "2023-05-21T22:40:45.345Z"
        }
    }
}
```
#### 7. Delete a post:
```graphql
mutation DeletePost {
    deletePost(id: "d46198f6-0a93-4078-b075-e3433410f91f")
}
```
Response:
```graphql
{
    "data": {
        "deletePost": true
    }
}
```

