CREATE TABLE "message" (
	"id" char(21) PRIMARY KEY NOT NULL,
	"time_created" double precision DEFAULT (EXTRACT(epoch FROM CURRENT_TIMESTAMP) * (1000)::numeric) NOT NULL,
	"time_updated" double precision DEFAULT (EXTRACT(epoch FROM CURRENT_TIMESTAMP) * (1000)::numeric) NOT NULL,
	"time_deleted" double precision DEFAULT (EXTRACT(epoch FROM CURRENT_TIMESTAMP) * (1000)::numeric),
	"content" varchar(10240)
);
