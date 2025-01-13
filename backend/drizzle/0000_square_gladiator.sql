CREATE TABLE "applicants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"firstname" varchar,
	"lastname" varchar,
	"phone" varchar,
	"email" varchar,
	"location" varchar,
	"addr" varchar,
	"city" varchar,
	"zip" varchar,
	"interest" varchar,
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
	"location" varchar,
	"addr" varchar,
	"city" varchar,
	"zip" varchar,
	"interest" varchar,
	"over16" boolean,
	"accepted_at" timestamp DEFAULT now()
);
