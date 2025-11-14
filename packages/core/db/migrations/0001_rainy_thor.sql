ALTER TABLE "message" ALTER COLUMN "content" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "message" ADD COLUMN "sender" varchar(255) NOT NULL;