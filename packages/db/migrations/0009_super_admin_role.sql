CREATE TYPE "public"."user_role" AS ENUM('user', 'super-admin');--> statement-breakpoint
UPDATE "user" SET role = 'super-admin' WHERE role = 'admin';--> statement-breakpoint
UPDATE "user" SET role = 'user' WHERE role IS NULL OR role NOT IN ('user', 'super-admin');--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "role" SET DATA TYPE "public"."user_role" USING (role::"public"."user_role");--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'user'::"public"."user_role";--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "role" SET NOT NULL;
