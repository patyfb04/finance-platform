CREATE TABLE "accounts" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"plaid_id" text DEFAULT '',
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
