import { describe, expect, test } from "bun:test";
import {
	apiRateLimitPlugin,
	type IdempotencyStore,
	idempotencyPlugin,
} from "@reloop/auth/middleware";
import { Elysia, t } from "elysia";

function memoryStore(): IdempotencyStore & { size: () => number } {
	const data = new Map<string, unknown>();
	return {
		get: async <T>(key: string) => data.get(key) as T | undefined,
		set: async (key, value) => {
			data.set(key, structuredClone(value));
		},
		setIfAbsent: async (key, value) => {
			if (data.has(key)) return false;
			data.set(key, structuredClone(value));
			return true;
		},
		delete: async (key) => {
			data.delete(key);
		},
		size: () => data.size,
	};
}

function service(store: IdempotencyStore) {
	let created = 0;
	let release: (() => void) | undefined;
	const app = new Elysia({ prefix: "/api/test" })
		.use(idempotencyPlugin({ store, excludePathSuffixes: ["/own"] }))
		.macro({
			auth: {
				resolve({ status, request }) {
					if (request.headers.get("x-api-key") !== "rl_good") {
						return status(401, { message: "Authentication required" });
					}
					return { organizationId: "org_1" };
				},
			},
		})
		.post(
			"/things",
			({ body, status }) => {
				created += 1;
				return status(201, { id: `thing_${created}`, name: body.name });
			},
			{ auth: true, body: t.Object({ name: t.String() }) },
		)
		.post(
			"/fails",
			({ status }) => {
				created += 1;
				return status(400, { message: "bad" });
			},
			{ auth: true },
		)
		.post(
			"/slow",
			async () => {
				await new Promise<void>((resolve) => {
					release = resolve;
				});
				created += 1;
				return { ok: true };
			},
			{ auth: true },
		)
		.post("/own", () => {
			created += 1;
			return { ok: true };
		});
	return {
		app,
		created: () => created,
		finishSlow: () => release?.(),
	};
}

const post = (path: string, body: unknown, headers: Record<string, string>) =>
	new Request(`http://localhost/api/test${path}`, {
		method: "POST",
		headers: {
			"content-type": "application/json",
			"x-api-key": "rl_good",
			...headers,
		},
		body: JSON.stringify(body),
	});

describe("idempotencyPlugin", () => {
	test("replays the first response without re-running the handler", async () => {
		const s = service(memoryStore());
		const first = await s.app.handle(
			post("/things", { name: "a" }, { "idempotency-key": "k1" }),
		);
		const second = await s.app.handle(
			post("/things", { name: "a" }, { "idempotency-key": "k1" }),
		);
		expect(first.status).toBe(201);
		expect(first.headers.get("idempotent-replayed")).toBeNull();
		expect(second.status).toBe(201);
		expect(second.headers.get("idempotent-replayed")).toBe("true");
		expect(await second.json()).toEqual(await first.json());
		expect(s.created()).toBe(1);
	});

	test("key order in the body does not change the fingerprint", async () => {
		const s = service(memoryStore());
		await s.app.handle(
			post("/things", { name: "a" }, { "idempotency-key": "k1" }),
		);
		const res = await s.app.handle(
			post("/things", { name: "a" }, { "idempotency-key": "k1" }),
		);
		expect(res.headers.get("idempotent-replayed")).toBe("true");
	});

	test("rejects key reuse with a different body (422)", async () => {
		const s = service(memoryStore());
		await s.app.handle(
			post("/things", { name: "a" }, { "idempotency-key": "k1" }),
		);
		const res = await s.app.handle(
			post("/things", { name: "b" }, { "idempotency-key": "k1" }),
		);
		expect(res.status).toBe(422);
		expect(s.created()).toBe(1);
	});

	test("concurrent retry gets 409 while the first is in flight", async () => {
		const s = service(memoryStore());
		const first = s.app.handle(post("/slow", {}, { "idempotency-key": "k2" }));
		await new Promise((r) => setTimeout(r, 10));
		const second = await s.app.handle(
			post("/slow", {}, { "idempotency-key": "k2" }),
		);
		expect(second.status).toBe(409);
		expect(second.headers.get("retry-after")).toBe("1");
		s.finishSlow();
		expect((await first).status).toBe(200);
		const third = await s.app.handle(
			post("/slow", {}, { "idempotency-key": "k2" }),
		);
		expect(third.headers.get("idempotent-replayed")).toBe("true");
		expect(s.created()).toBe(1);
	});

	test("failed requests release the key so a retry runs again", async () => {
		const store = memoryStore();
		const s = service(store);
		await s.app.handle(post("/fails", {}, { "idempotency-key": "k3" }));
		await s.app.handle(post("/fails", {}, { "idempotency-key": "k3" }));
		expect(s.created()).toBe(2);
		expect(store.size()).toBe(0);
	});

	test("auth failures do not leave the key locked", async () => {
		const store = memoryStore();
		const s = service(store);
		const res = await s.app.handle(
			post(
				"/things",
				{ name: "a" },
				{
					"idempotency-key": "k4",
					"x-api-key": "rl_bad",
				},
			),
		);
		expect(res.status).toBe(401);
		// Released by onAfterResponse, which runs after the response is sent.
		await new Promise((r) => setTimeout(r, 5));
		expect(store.size()).toBe(0);
	});

	test("no header, excluded paths and oversized keys", async () => {
		const s = service(memoryStore());
		await s.app.handle(post("/things", { name: "a" }, {}));
		await s.app.handle(post("/things", { name: "a" }, {}));
		await s.app.handle(post("/own", {}, { "idempotency-key": "k5" }));
		await s.app.handle(post("/own", {}, { "idempotency-key": "k5" }));
		expect(s.created()).toBe(4);
		const res = await s.app.handle(
			post("/things", { name: "a" }, { "idempotency-key": "x".repeat(256) }),
		);
		expect(res.status).toBe(400);
	});

	test("keys are scoped per credential", async () => {
		const s = service(memoryStore());
		await s.app.handle(
			post("/things", { name: "a" }, { "idempotency-key": "k6" }),
		);
		const other = await s.app.handle(
			post(
				"/things",
				{ name: "a" },
				{
					"idempotency-key": "k6",
					"x-api-key": "rl_bad",
				},
			),
		);
		expect(other.status).toBe(401);
		expect(other.headers.get("idempotent-replayed")).toBeNull();
	});

	test("fails open when the store errors", async () => {
		const broken: IdempotencyStore = {
			get: () => Promise.reject(new Error("down")),
			set: async () => {},
			setIfAbsent: async () => true,
			delete: async () => {},
		};
		const s = service(broken);
		await s.app.handle(
			post("/things", { name: "a" }, { "idempotency-key": "k7" }),
		);
		const res = await s.app.handle(
			post("/things", { name: "a" }, { "idempotency-key": "k7" }),
		);
		expect(res.status).toBe(201);
		expect(s.created()).toBe(2);
	});
});

describe("idempotencyPlugin body types", () => {
	test("skips non-JSON bodies", async () => {
		let calls = 0;
		const app = new Elysia()
			.use(idempotencyPlugin({ store: memoryStore() }))
			.post("/upload", () => {
				calls += 1;
				return { ok: true };
			});
		for (const text of ["first", "second"]) {
			await app.handle(
				new Request("http://localhost/upload", {
					method: "POST",
					headers: {
						"content-type": "text/plain",
						"x-api-key": "rl_good",
						"idempotency-key": "same",
					},
					body: text,
				}),
			);
		}
		expect(calls).toBe(2);
	});
});

describe("idempotencyPlugin with strict route schemas", () => {
	test("keeps its own status codes and single-valued headers", async () => {
		let calls = 0;
		let finish = () => {};
		const counts = new Map<string, number>();
		const app = new Elysia()
			.use(
				apiRateLimitPlugin({
					redis: {
						increment: async (k) => {
							counts.set(k, (counts.get(k) ?? 0) + 1);
							return counts.get(k) ?? 0;
						},
						expire: async () => 1,
						ttl: async () => 30,
					},
					max: 100,
				}),
			)
			.use(idempotencyPlugin({ store: memoryStore() }))
			.post(
				"/c",
				async () => {
					calls += 1;
					if (calls === 1) {
						await new Promise<void>((resolve) => {
							finish = resolve;
						});
					}
					return { ok: true };
				},
				{
					body: t.Object({ a: t.String() }),
					response: {
						200: t.Object({ ok: t.Boolean() }),
						400: t.Object({ message: t.Literal("Invalid email") }),
						409: t.Object({ message: t.Literal("Contact already exists") }),
					},
				},
			);
		const send = (key: string, a = "1") =>
			app.handle(
				new Request("http://localhost/c", {
					method: "POST",
					headers: {
						"content-type": "application/json",
						"x-api-key": "rl_good",
						"idempotency-key": key,
					},
					body: JSON.stringify({ a }),
				}),
			);

		expect((await send("x".repeat(256))).status).toBe(400);
		const first = send("k");
		await new Promise((r) => setTimeout(r, 10));
		const busy = await send("k");
		expect(busy.status).toBe(409);
		expect(busy.headers.get("ratelimit-remaining")).toMatch(/^\d+$/);
		finish();
		expect((await first).status).toBe(200);
		const replay = await send("k");
		expect(replay.status).toBe(200);
		expect(replay.headers.get("idempotent-replayed")).toBe("true");
		expect(replay.headers.get("ratelimit-remaining")).toMatch(/^\d+$/);
		expect((await send("k", "2")).status).toBe(422);
		expect(calls).toBe(1);
	});
});
