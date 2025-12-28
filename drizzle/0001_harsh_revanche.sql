ALTER TABLE "accounts" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "accounts" ALTER COLUMN "user_id" TYPE text;
ALTER TABLE "accounts" ALTER COLUMN "user_id" SET NOT NULL;