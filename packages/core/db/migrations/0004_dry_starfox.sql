CREATE TABLE "cms_menu" (
	"club_id" char(21) PRIMARY KEY NOT NULL,
	"time_updated" double precision DEFAULT (EXTRACT(epoch FROM CURRENT_TIMESTAMP) * (1000)::numeric) NOT NULL,
	"config" json NOT NULL
);
--> statement-breakpoint
ALTER TABLE "cms_page" ADD CONSTRAINT "page_slug_unique" UNIQUE NULLS NOT DISTINCT("club_id","parent_id","slug");