CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "applicants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"firstname" varchar,
	"lastname" varchar,
	"phone" varchar,
	"email" varchar,
	"location" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"addr" varchar,
	"city" varchar,
	"zip" varchar,
	"interest" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"over16" boolean,
	"applied_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"firstname" varchar,
	"lastname" varchar,
	"phone" varchar,
	"email" varchar,
	"location" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"addr" varchar,
	"city" varchar,
	"zip" varchar,
	"interest" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"over16" boolean,
	"accepted_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;