import { healthPostgresRoute } from "@be/contacts/routes/landing/routes/health-postgres.route";
import { healthRedisRoute } from "@be/contacts/routes/landing/routes/health-redis.route";
import { rootRoute } from "@be/contacts/routes/landing/routes/root.route";
import { Elysia } from "elysia";

export const landing = new Elysia()
	.use(rootRoute)
	.use(healthRedisRoute)
	.use(healthPostgresRoute);
