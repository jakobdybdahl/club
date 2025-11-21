ALTER TABLE "account" ALTER COLUMN "time_deleted" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "club" ALTER COLUMN "time_deleted" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "event" ALTER COLUMN "time_deleted" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "permission_group" ALTER COLUMN "time_deleted" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "permission_group_member" ALTER COLUMN "time_deleted" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "time_deleted" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "time_seen" DROP DEFAULT;