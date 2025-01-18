CREATE TABLE "applicantSession" (
	"id" text PRIMARY KEY NOT NULL,
	"applicant_id" uuid NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "applicantSession" ADD CONSTRAINT "applicantSession_applicant_id_applicants_id_fk" FOREIGN KEY ("applicant_id") REFERENCES "public"."applicants"("id") ON DELETE no action ON UPDATE no action;