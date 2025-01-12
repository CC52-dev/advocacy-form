CREATE TABLE "applicants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"firstname" varchar(256),
	"lastname" varchar(256),
	"phone" varchar(256),
	"email" varchar(256),
	"location" varchar(256),
	"addr" varchar(256),
	"city" varchar(256),
	"zip" varchar(256),
	"interest" varchar(256),
	"over16" boolean,
	"applied_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"firstname" varchar(256),
	"lastname" varchar(256),
	"phone" varchar(256),
	"email" varchar(256),
	"location" varchar(256),
	"addr" varchar(256),
	"city" varchar(256),
	"zip" varchar(256),
	"interest" varchar(256),
	"over16" boolean,
	"accepted_at" timestamp DEFAULT now()
);
