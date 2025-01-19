CREATE TABLE "otp" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar,
	"otp" varchar,
	"created_at" timestamp DEFAULT now()
);
