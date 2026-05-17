import { mock } from "bun:test";
import { Elysia } from "elysia";
import { TEST_ORG_ID, TEST_USER_ID } from "./helpers/fixtures";
import { buildMockEvlog, WEBHOOK_EVENTS } from "./helpers/mock-modules";

// ─── Env ──────────────────────────────────────────────────────────────────────
process.env.NODE_ENV = "test";
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
process.env.BASE_URL = "http://localhost:8012";

// ─── Shared DB state via globalThis (bridges preload ↔ test file) ─────────────
type DbState = {
	findFirst: unknown;
	findMany: unknown[];
	insert: unknown[];
	update: unknown[];
	deleteRow: unknown[];
	selectCount: unknown[];
};

(globalThis as Record<string, unknown>).__testDbState = {
	findFirst: undefined,
	findMany: [],
	insert: [],
	update: [],
	deleteRow: [],
	selectCount: [{ count: 0 }],
} satisfies DbState;

const g = () =>
	(globalThis as Record<string, unknown>).__testDbState as DbState;

mock.module("@reloop/db/client", () => ({
	db: {
		insert: () => ({ values: () => ({ returning: async () => g().insert }) }),
		update: () => ({
			set: () => ({ where: () => ({ returning: async () => g().update }) }),
		}),
		delete: () => ({ where: () => ({ returning: async () => g().deleteRow }) }),
		select: () => ({ from: () => ({ where: async () => g().selectCount }) }),
		query: {
			apikey: {
				findFirst: async () => g().findFirst,
				findMany: async () => g().findMany,
			},
		},
		execute: async () => [],
	},
}));

// ─── Auth middleware ───────────────────────────────────────────────────────────
mock.module("@reloop/api-key/middleware/auth", () => {
	const session = {
		userId: TEST_USER_ID,
		organizationId: TEST_ORG_ID,
		authType: "apiKey" as const,
		traceId: "test-trace-id",
	};
	const authMiddleware = new Elysia({ name: "auth-middleware" }).macro({
		auth: {
			resolve({
				request,
				status,
			}: {
				request: Request;
				status: (code: number, response?: unknown) => unknown;
			}) {
				const key =
					request.headers.get("x-api-key") ??
					request.headers.get("authorization")?.replace("Bearer ", "");
				if (key !== "test-api-key")
					return (status as (code: number, response?: unknown) => unknown)(
						401,
						{
							message: "Authentication required",
						},
					);
				return session;
			},
		},
		apiKeyAuth: {
			resolve({
				request,
				status,
			}: {
				request: Request;
				status: (code: number, response?: unknown) => unknown;
			}) {
				const key = request.headers.get("x-api-key");
				if (key !== "test-api-key")
					return (status as (code: number, response?: unknown) => unknown)(
						401,
						{
							message: "Authentication required",
						},
					);
				return session;
			},
		},
		cookieAuth: {
			resolve({
				status,
			}: {
				status: (code: number, response?: unknown) => unknown;
			}) {
				return (status as (code: number, response?: unknown) => unknown)(401, {
					message: "Authentication required",
				});
			},
		},
	});
	return { authMiddleware };
});

// ─── Rate limit ───────────────────────────────────────────────────────────────
mock.module("@reloop/api-key/middleware/rate-limit", () => ({
	rateLimitPlugin: () => new Elysia(),
}));

// ─── Drizzle helpers ──────────────────────────────────────────────────────────
mock.module("@reloop/db/schema", () => ({ apikey: {} }));
mock.module("drizzle-orm", () => ({
	and: (...args: unknown[]) => args,
	eq: (_: unknown, v: unknown) => v,
	or: (...args: unknown[]) => args,
	ilike: (_: unknown, v: unknown) => v,
	desc: (c: unknown) => c,
	count: () => ({ count: "count" }),
}));

// ─── Bus ──────────────────────────────────────────────────────────────────────
mock.module("@reloop/bus", () => ({
	bus: { publish: async () => {} },
	BusEvent: {
		API_KEY_CREATED: "api_key.created",
		API_KEY_UPDATED: "api_key.updated",
		API_KEY_DELETED: "api_key.deleted",
		API_KEY_ROTATED: "api_key.rotated",
		API_KEY_ENABLED: "api_key.enabled",
		API_KEY_DISABLED: "api_key.disabled",
	},
}));

// ─── Logging ──────────────────────────────────────────────────────────────────
const evlog = buildMockEvlog();
mock.module("evlog", () => evlog);
mock.module("evlog/elysia", () => ({
	useLogger: evlog.useLogger, // returns the logger object with .info/.error/.warn
	evlog: () => new Elysia(),
}));

// ─── Webhook events ───────────────────────────────────────────────────────────
mock.module("@reloop/webhook-events", () => WEBHOOK_EVENTS);

// ─── Redis / Cache ────────────────────────────────────────────────────────────
mock.module("@reloop/cache/redis-client", () => ({
	RedisCache: class {
		get = async () => null;
		set = async () => {};
		healthCheck = async () => true;
	},
}));
mock.module("@reloop/api-key/utils/loader", () => ({
	redis: {
		get: async () => null,
		set: async () => {},
		healthCheck: async () => {},
	},
	loader: async () => {},
}));

// ─── @reloop/apikey ───────────────────────────────────────────────────────────
mock.module("@reloop/apikey", () => ({
	validateApiKey: async (key: string | null | undefined) => {
		if (key === "test-api-key")
			return {
				userId: TEST_USER_ID,
				organizationId: TEST_ORG_ID,
				authType: "apiKey" as const,
			};
		return null;
	},
	generateApiKey: () => "rl_live_newkey_abc123def456ghi",
	hashApiKey: (key: string) => `hashed_${key}`,
	getKeyStart: (key: string) => key.substring(0, 8),
	API_KEY_PREFIX: "rl",
}));
