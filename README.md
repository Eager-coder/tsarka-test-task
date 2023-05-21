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

Testing is build using Jest. Be aware that after each test, the tables are truncated. 

### To run tests:

```bash
yarn test
```