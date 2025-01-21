ALTER TABLE "otp" ALTER COLUMN "otp" SET DATA TYPE varchar(6);--> statement-breakpoint
ALTER TABLE "otp" ALTER COLUMN "otp" SET DEFAULT floor(random() * (999999 - 100000 + 1) + 100000)::text;--> statement-breakpoint
ALTER TABLE "otp" ALTER COLUMN "otp" SET NOT NULL;