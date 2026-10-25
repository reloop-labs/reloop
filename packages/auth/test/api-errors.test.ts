import { describe, expect, test } from "bun:test";
import { apiErrorsPlugin } from "@reloop/auth/middleware";
import { Elysia, t } from "elysia";
import { createError } from "evlog";

const app = new Elysia({ prefix: "/api/test" })
	.use(apiErrorsPlugin())
	.post("/items", ({ body }) => body, {
		body: t.Object({ name: t.String(), count: t.Number() }),
	})
	.get("/thrown", () => {
		throw createError({
			status: 409,
			message: "Item already exists",
			why: "An item with this name exists.",
			fix: "Pick another name.",
		});
	})
	.get("/crash", () => {
		throw new Error('Failed query: select "secret" from "users"');
	})
	.get(
		"/status",
		({ status }) => status(403, { message: "Nope", why: "w", fix: "f" }),
		{
			response: {
				200: t.String(),
				403: t.Object(
					{ message: t.String(), why: t.String(), fix: t.String() },
					{ additionalProperties: false },
				),
			},
		},
	)
	.get("/set-status", ({ set }) => {
		set.status = 400;
		return { message: "Bad input" };
	})
	.get("/ok", () => ({ message: "fine" }));

const call = async (path: string, init?: RequestInit) => {
	const res = await app.handle(
		new Request(`http://localhost/api/test${path}`, init),
	);
	return {
		status: res.status,
		body: (await res.json()) as Record<string, unknown>,
	};
};

const jsonPost = (body: string): RequestInit => ({
	method: "POST",
	headers: { "content-type": "application/json" },
	body,
});

describe("apiErrorsPlugin", () => {
	test("validation errors list fields instead of a schema dump", async () => {
		const { status, body } = await call("/items", jsonPost('{"name":1}'));
		expect(status).toBe(422);
		expect(body.code).toBe("validation_error");
		expect(body.message).toBe("Invalid request");
		expect(String(body.message)).not.toContain("{");
		const errors = body.errors as Array<{ path: string; message: string }>;
		expect(errors.length).toBeGreaterThan(0);
		expect(errors.map((e) => e.path)).toContain("/name");
	});

	test("unknown routes", async () => {
		const { status, body } = await call("/missing");
		expect(status).toBe(404);
		expect(body).toMatchObject({ code: "not_found", message: "Not found" });
		expect(String(body.why)).toContain("GET /api/test/missing");
	});

	test("malformed JSON", async () => {
		const { status, body } = await call("/items", jsonPost("{bad"));
		expect(status).toBe(400);
		expect(body.code).toBe("bad_request");
	});

	test("createError keeps its message, why, fix and status", async () => {
		const { status, body } = await call("/thrown");
		expect(status).toBe(409);
		expect(body).toMatchObject({
			code: "conflict",
			message: "Item already exists",
			why: "An item with this name exists.",
			fix: "Pick another name.",
			link: "https://reloop.sh/docs/api/errors",
		});
	});

	test("unexpected errors do not leak internals", async () => {
		const { status, body } = await call("/crash");
		expect(status).toBe(500);
		expect(body.code).toBe("internal_error");
		expect(JSON.stringify(body)).not.toContain("secret");
	});

	test("adds code to returned error bodies, even under strict schemas", async () => {
		const direct = await call("/status");
		expect(direct.status).toBe(403);
		expect(direct.body).toMatchObject({ code: "forbidden", message: "Nope" });
		const viaSet = await call("/set-status");
		expect(viaSet.status).toBe(400);
		expect(viaSet.body.code).toBe("bad_request");
	});

	test("leaves successful responses alone", async () => {
		const { status, body } = await call("/ok");
		expect(status).toBe(200);
		expect(body).toEqual({ message: "fine" });
	});
});
