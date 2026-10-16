ALTER TABLE "template" ADD COLUMN IF NOT EXISTS "slug" varchar(128);--> statement-breakpoint
-- Backfill: slugify the name, then suffix -2, -3… for live duplicates within an org.
-- Soft-deleted rows keep the bare slug; the unique index ignores them.
WITH base AS (
	SELECT
		"id",
		"organization_id",
		"deleted_at",
		"created_at",
		COALESCE(
			NULLIF(
				left(
					regexp_replace(
						regexp_replace(lower("name"), '[^a-z0-9]+', '-', 'g'),
						'^-+|-+$', '', 'g'
					),
					120
				),
				''
			),
			'template'
		) AS "base_slug"
	FROM "template"
	WHERE "slug" IS NULL
),
ranked AS (
	SELECT
		"id",
		CASE
			WHEN "deleted_at" IS NOT NULL THEN "base_slug"
			WHEN row_number() OVER w = 1 THEN "base_slug"
			ELSE "base_slug" || '-' || row_number() OVER w
		END AS "candidate",
		"deleted_at",
		"organization_id",
		"created_at"
	FROM base
	WINDOW w AS (
		PARTITION BY "organization_id", "base_slug", ("deleted_at" IS NULL)
		ORDER BY "created_at", "id"
	)
),
-- A generated "welcome-2" can collide with a template literally named "Welcome 2";
-- the later one falls back to an id suffix.
deduped AS (
	SELECT
		"id",
		CASE
			WHEN "deleted_at" IS NULL
				AND row_number() OVER (
					PARTITION BY "organization_id", "candidate", ("deleted_at" IS NULL)
					ORDER BY "created_at", "id"
				) > 1
			THEN left("candidate", 100) || '-' || right("id", 8)
			ELSE "candidate"
		END AS "slug"
	FROM ranked
)
UPDATE "template" t SET "slug" = d."slug" FROM deduped d WHERE t."id" = d."id";--> statement-breakpoint
ALTER TABLE "template" ALTER COLUMN "slug" SET NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "template_unique_org_slug" ON "template" USING btree ("organization_id","slug") WHERE "template"."deleted_at" is null;
