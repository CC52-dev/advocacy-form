CREATE TYPE "public"."type" AS ENUM('admin', 'user', 'applicant', 'disabled');--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "type" SET DATA TYPE type;