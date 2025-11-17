CREATE TYPE "public"."file_upload_state" AS ENUM('pending-upload', 'uploaded', 'removing');--> statement-breakpoint
CREATE TYPE "public"."permission_type" AS ENUM('admin', 'add:user', 'update:user', 'delete:user');--> statement-breakpoint
CREATE TABLE "account" (
	"id" char(21) PRIMARY KEY NOT NULL,
	"time_created" double precision DEFAULT (EXTRACT(epoch FROM CURRENT_TIMESTAMP) * (1000)::numeric) NOT NULL,
	"time_updated" double precision DEFAULT (EXTRACT(epoch FROM CURRENT_TIMESTAMP) * (1000)::numeric) NOT NULL,
	"time_deleted" double precision DEFAULT (EXTRACT(epoch FROM CURRENT_TIMESTAMP) * (1000)::numeric),
	"email" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "club" (
	"id" char(21) PRIMARY KEY NOT NULL,
	"time_created" double precision DEFAULT (EXTRACT(epoch FROM CURRENT_TIMESTAMP) * (1000)::numeric) NOT NULL,
	"time_updated" double precision DEFAULT (EXTRACT(epoch FROM CURRENT_TIMESTAMP) * (1000)::numeric) NOT NULL,
	"time_deleted" double precision DEFAULT (EXTRACT(epoch FROM CURRENT_TIMESTAMP) * (1000)::numeric),
	"name" varchar(255) NOT NULL,
	"short_code" varchar(10) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"old_slug" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "event" (
	"id" char(21) NOT NULL,
	"club_id" char(21) NOT NULL,
	"time_created" double precision DEFAULT (EXTRACT(epoch FROM CURRENT_TIMESTAMP) * (1000)::numeric) NOT NULL,
	"time_updated" double precision DEFAULT (EXTRACT(epoch FROM CURRENT_TIMESTAMP) * (1000)::numeric) NOT NULL,
	"time_deleted" double precision DEFAULT (EXTRACT(epoch FROM CURRENT_TIMESTAMP) * (1000)::numeric),
	"creator_id" varchar NOT NULL,
	"creator_type" varchar NOT NULL,
	"name" varchar(255) NOT NULL,
	"visibility" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE "file" (
	"id" char(21) NOT NULL,
	"club_id" char(21) NOT NULL,
	"creator_id" varchar NOT NULL,
	"creator_type" varchar NOT NULL,
	"time_created" double precision DEFAULT (EXTRACT(epoch FROM CURRENT_TIMESTAMP) * (1000)::numeric) NOT NULL,
	"time_updated" double precision DEFAULT (EXTRACT(epoch FROM CURRENT_TIMESTAMP) * (1000)::numeric) NOT NULL,
	"name" varchar NOT NULL,
	"size" integer NOT NULL,
	"content_type" varchar,
	"state" "file_upload_state" DEFAULT 'pending-upload' NOT NULL,
	"subject_id" char(21) NOT NULL,
	"subject_type" varchar NOT NULL,
	CONSTRAINT "file_club_id_id_pk" PRIMARY KEY("club_id","id")
);
--> statement-breakpoint
CREATE TABLE "permission_group" (
	"id" char(21) NOT NULL,
	"club_id" char(21) NOT NULL,
	"time_created" double precision DEFAULT (EXTRACT(epoch FROM CURRENT_TIMESTAMP) * (1000)::numeric) NOT NULL,
	"time_updated" double precision DEFAULT (EXTRACT(epoch FROM CURRENT_TIMESTAMP) * (1000)::numeric) NOT NULL,
	"time_deleted" double precision DEFAULT (EXTRACT(epoch FROM CURRENT_TIMESTAMP) * (1000)::numeric),
	"creator_id" varchar NOT NULL,
	"creator_type" varchar NOT NULL,
	"permissions" json DEFAULT '[]'::json NOT NULL,
	"name" varchar(255) NOT NULL,
	"old_name" varchar(255),
	"immutable" boolean DEFAULT false,
	CONSTRAINT "permission_group_club_id_id_pk" PRIMARY KEY("club_id","id"),
	CONSTRAINT "unique_name" UNIQUE("club_id","name")
);
--> statement-breakpoint
CREATE TABLE "permission_group_member" (
	"club_id" char(21) NOT NULL,
	"time_created" double precision DEFAULT (EXTRACT(epoch FROM CURRENT_TIMESTAMP) * (1000)::numeric) NOT NULL,
	"time_updated" double precision DEFAULT (EXTRACT(epoch FROM CURRENT_TIMESTAMP) * (1000)::numeric) NOT NULL,
	"time_deleted" double precision DEFAULT (EXTRACT(epoch FROM CURRENT_TIMESTAMP) * (1000)::numeric),
	"creator_id" varchar NOT NULL,
	"creator_type" varchar NOT NULL,
	"user_id" char(21) NOT NULL,
	"group_id" char(21) NOT NULL,
	CONSTRAINT "permission_group_member_club_id_group_id_user_id_pk" PRIMARY KEY("club_id","group_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" char(21) NOT NULL,
	"club_id" char(21) NOT NULL,
	"time_created" double precision DEFAULT (EXTRACT(epoch FROM CURRENT_TIMESTAMP) * (1000)::numeric) NOT NULL,
	"time_updated" double precision DEFAULT (EXTRACT(epoch FROM CURRENT_TIMESTAMP) * (1000)::numeric) NOT NULL,
	"time_deleted" double precision DEFAULT (EXTRACT(epoch FROM CURRENT_TIMESTAMP) * (1000)::numeric),
	"creator_id" varchar NOT NULL,
	"creator_type" varchar NOT NULL,
	"full_name" varchar(255),
	"username" varchar(255),
	"email" varchar(255) NOT NULL,
	"initials" varchar(10) NOT NULL,
	"color" varchar(100) NOT NULL,
	"time_seen" double precision DEFAULT (EXTRACT(epoch FROM CURRENT_TIMESTAMP) * (1000)::numeric),
	CONSTRAINT "user_club_id_id_pk" PRIMARY KEY("club_id","id")
);
--> statement-breakpoint
ALTER TABLE "permission_group_member" ADD CONSTRAINT "user_fk" FOREIGN KEY ("club_id","user_id") REFERENCES "public"."user"("club_id","id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "permission_group_member" ADD CONSTRAINT "permission_group_fk" FOREIGN KEY ("club_id","group_id") REFERENCES "public"."permission_group"("club_id","id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "email" ON "account" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "slug" ON "club" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "subject_idx" ON "file" USING btree ("club_id","subject_id","id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_email" ON "user" USING btree ("club_id","email");--> statement-breakpoint
CREATE INDEX "email_global" ON "user" USING btree ("email");