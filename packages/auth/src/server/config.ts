/**
 * Env-driven config for the single runtime Better Auth instance.
 * Reads process.env at module load (set env before importing `@reloop/auth/server`).
 */
export const authServerConfig = {
	PG_URL:
		process.env.PG_URL || "postgresql://reloop:reloop123@localhost:5432/reloop",
	REDIS_URL: process.env.REDIS_URL || "redis://:reloop123@localhost:6379",
	BASE_URL: process.env.BASE_URL || "https://local.reloop.sh",
	NODE_ENV: process.env.NODE_ENV || "development",
	BETTER_AUTH_SECRET:
		process.env.BETTER_AUTH_SECRET || "tENkVU4GrhckuRw4Bcfh93EWgXOFcszn",
	GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
	GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
	GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
	GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
	DEFAULT_OTP: process.env.DEFAULT_OTP,
	DISABLE_SIGNUP: process.env.DISABLE_SIGNUP,
	/** When true, new accounts require a valid platform signup invite. */
	REQUIRE_SIGNUP_INVITE: process.env.REQUIRE_SIGNUP_INVITE === "true",
	NATS_URL: process.env.NATS_URL || "nats://localhost:4222",
};
