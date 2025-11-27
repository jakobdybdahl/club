CREATE TABLE "cms_page" (
	"id" char(21) NOT NULL,
	"club_id" char(21) NOT NULL,
	"time_created" double precision DEFAULT (EXTRACT(epoch FROM CURRENT_TIMESTAMP) * (1000)::numeric) NOT NULL,
	"time_updated" double precision DEFAULT (EXTRACT(epoch FROM CURRENT_TIMESTAMP) * (1000)::numeric) NOT NULL,
	"time_deleted" double precision,
	"creator_id" varchar NOT NULL,
	"creator_type" varchar NOT NULL,
	"title" varchar(255) NOT NULL,
	"visibility" varchar NOT NULL,
	"slug" varchar NOT NULL,
	"body" json NOT NULL,
	"parent_id" char(21),
	CONSTRAINT "cms_page_club_id_id_pk" PRIMARY KEY("club_id","id")
);
--> statement-breakpoint
CREATE TABLE "custom-domain" (
	"creator_id" varchar NOT NULL,
	"creator_type" varchar NOT NULL,
	"time_created" double precision DEFAULT (EXTRACT(epoch FROM CURRENT_TIMESTAMP) * (1000)::numeric) NOT NULL,
	"time_updated" double precision DEFAULT (EXTRACT(epoch FROM CURRENT_TIMESTAMP) * (1000)::numeric) NOT NULL,
	"club_id" char(21) PRIMARY KEY NOT NULL,
	"domain" varchar(255)
);
--> statement-breakpoint
ALTER TABLE "cms_page" ADD CONSTRAINT "page_parent_fk" FOREIGN KEY ("club_id","parent_id") REFERENCES "public"."cms_page"("club_id","id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "domain_unique_idx" ON "custom-domain" USING btree ("domain");