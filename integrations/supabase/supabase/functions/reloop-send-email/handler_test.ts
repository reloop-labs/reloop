import assert from "node:assert/strict";
import { Webhook } from "standardwebhooks";
import { createHandler } from "./handler.ts";

const secret = btoa("test-hook-secret-with-32-characters");
const signer = new Webhook(secret);
const configuration = {
	apiKey: "test-api-key",
	from: "Example <auth@example.com>",
	hookSecret: `v1,whsec_${secret}`,
	supabaseUrl: "https://project.supabase.co",
};

function payload(action = "signup") {
	return {
		user: { email: "current@example.com", new_email: "new@example.com" },
		email_data: {
			email_action_type: action,
			token: "123456",
			token_hash: "hash-for-new-address",
			token_new: "654321",
			token_hash_new: "hash-for-current-address",
			redirect_to: "https://app.example.com/callback?next=%2Faccount&lang=en",
		},
	};
}

function signedRequest(body: unknown, date = new Date()): Request {
	const content = JSON.stringify(body);
	const id = "hook-event-123";
	return new Request(
		"https://project.supabase.co/functions/v1/reloop-send-email",
		{
			method: "POST",
			headers: {
				"webhook-id": id,
				"webhook-timestamp": Math.floor(date.getTime() / 1000).toString(),
				"webhook-signature": signer.sign(id, date, content),
			},
			body: content,
		},
	);
}

function setup(
	response = () => Response.json({ success: true, status: "sent" }),
) {
	const requests: Request[] = [];
	const send: typeof fetch = (input, init) => {
		requests.push(new Request(input, init));
		return Promise.resolve(response());
	};
	return { requests, handler: createHandler(configuration, send) };
}

for (const action of ["signup", "invite", "magiclink", "recovery"]) {
	Deno.test(`${action} sends a verification link and code through Reloop`, async () => {
		const { requests, handler } = setup();
		const response = await handler(signedRequest(payload(action)));
		assert.equal(response.status, 200);
		assert.deepEqual(await response.json(), {});
		assert.equal(requests.length, 1);
		assert.equal(requests[0].url, "https://reloop.sh/api/mail/v1/send");
		assert.equal(
			requests[0].headers.get("Authorization"),
			"Bearer test-api-key",
		);
		assert.equal(requests[0].redirect, "error");
		const message = await requests[0].json();
		assert.equal(message.from, configuration.from);
		assert.equal(message.to, "current@example.com");
		assert.ok(message.text.includes("123456"));
		assert.equal(message.html, undefined);
		const link = new URL(message.text.split("\n").at(-1));
		assert.equal(link.origin, configuration.supabaseUrl);
		assert.equal(link.pathname, "/auth/v1/verify");
		assert.equal(link.searchParams.get("type"), action);
		assert.equal(link.searchParams.get("token"), "hash-for-new-address");
		assert.equal(
			link.searchParams.get("redirect_to"),
			payload().email_data.redirect_to,
		);
	});
}

Deno.test("secure email change sends each token and hash only to its intended address", async () => {
	const { requests, handler } = setup();
	assert.equal(
		(await handler(signedRequest(payload("email_change")))).status,
		200,
	);
	const [current, next] = await Promise.all(
		requests.map((request) => request.json()),
	);
	assert.equal(current.to, "current@example.com");
	assert.ok(current.text.includes("123456"));
	assert.ok(current.text.includes("hash-for-current-address"));
	assert.ok(!current.text.includes("654321"));
	assert.equal(next.to, "new@example.com");
	assert.ok(next.text.includes("654321"));
	assert.ok(next.text.includes("hash-for-new-address"));
	assert.ok(!next.text.includes("123456"));
	assert.notEqual(
		requests[0].headers.get("Idempotency-Key"),
		requests[1].headers.get("Idempotency-Key"),
	);
});

for (const tokenField of ["token", "token_new"] as const) {
	Deno.test(`single email change accepts ${tokenField} and only sends to the new address`, async () => {
		const { requests, handler } = setup();
		const body = payload("email_change");
		body.email_data.token_hash_new = "";
		body.email_data[tokenField === "token" ? "token_new" : "token"] = "";
		assert.equal((await handler(signedRequest(body))).status, 200);
		assert.equal(requests.length, 1);
		const message = await requests[0].json();
		assert.equal(message.to, "new@example.com");
		assert.ok(message.text.includes(body.email_data[tokenField]));
		assert.ok(message.text.includes("hash-for-new-address"));
	});
}

Deno.test("reauthentication sends a code without a link", async () => {
	const { requests, handler } = setup();
	const body = payload("reauthentication");
	body.email_data.token_hash = "";
	assert.equal((await handler(signedRequest(body))).status, 200);
	const message = await requests[0].json();
	assert.ok(message.text.includes("123456"));
	assert.ok(!message.text.includes("https://"));
});

Deno.test("rejects missing, invalid, tampered, and expired signatures without sending", async () => {
	const { requests, handler } = setup();
	const missing = signedRequest(payload());
	missing.headers.delete("webhook-signature");
	const invalid = signedRequest(payload());
	invalid.headers.set("webhook-signature", "v1,invalid");
	const original = signedRequest(payload());
	const tampered = new Request(original.url, {
		method: "POST",
		headers: original.headers,
		body: JSON.stringify(payload("recovery")),
	});
	const expired = signedRequest(payload(), new Date(Date.now() - 600_000));
	for (const request of [missing, invalid, tampered, expired]) {
		assert.equal((await handler(request)).status, 401);
	}
	assert.equal(requests.length, 0);
});

Deno.test("rejects incomplete or unsupported signed payloads before sending", async () => {
	const { requests, handler } = setup();
	const missingRecipient = payload("email_change");
	missingRecipient.user.new_email = "";
	const missingHash = payload();
	missingHash.email_data.token_hash = "";
	for (const body of [
		null,
		{},
		payload("unknown"),
		payload("__proto__"),
		missingRecipient,
		missingHash,
	]) {
		assert.equal((await handler(signedRequest(body))).status, 400);
	}
	assert.equal(requests.length, 0);
});

Deno.test("non-POST requests do not send mail", async () => {
	const { requests, handler } = setup();
	const response = await handler(new Request("https://example.com"));
	assert.equal(response.status, 405);
	assert.equal(response.headers.get("Allow"), "POST");
	assert.equal(requests.length, 0);
});

Deno.test("retry after a partial failure reuses a distinct idempotency key per recipient", async () => {
	let calls = 0;
	const { requests, handler } = setup(() => {
		calls += 1;
		return calls === 2
			? new Response("private provider details", { status: 429 })
			: Response.json({ success: true, status: "sent" });
	});
	assert.equal(
		(await handler(signedRequest(payload("email_change")))).status,
		502,
	);
	assert.equal(
		(await handler(signedRequest(payload("email_change")))).status,
		200,
	);
	assert.equal(
		requests[0].headers.get("Idempotency-Key"),
		requests[2].headers.get("Idempotency-Key"),
	);
	assert.equal(
		requests[1].headers.get("Idempotency-Key"),
		requests[3].headers.get("Idempotency-Key"),
	);
});

for (const response of [
	() => new Response("private provider details", { status: 500 }),
	() => Response.json({ success: false }),
	() => Response.json(null),
	() => Response.json({ success: true, status: "pending" }),
	() => Response.json({ success: true, status: "failed" }),
	() => new Response("invalid JSON"),
	() => {
		throw new Error("private network details");
	},
]) {
	Deno.test("provider failures return a generic hook error", async () => {
		const { handler } = setup(response);
		const result = await handler(signedRequest(payload()));
		assert.equal(result.status, 502);
		assert.deepEqual(await result.json(), {
			error: { http_code: 502, message: "Reloop could not accept the email" },
		});
	});
}

Deno.test("supports an HTTPS self-hosted API and rejects insecure configuration", async () => {
	let url = "";
	const handler = createHandler(
		{ ...configuration, apiUrl: "https://mail.example.com/api/mail/v1/send" },
		(input) => {
			url = String(input);
			return Promise.resolve(Response.json({ success: true, status: "sent" }));
		},
	);
	assert.equal((await handler(signedRequest(payload()))).status, 200);
	assert.equal(url, "https://mail.example.com/api/mail/v1/send");
	for (const overrides of [
		{ apiKey: "" },
		{ from: "" },
		{ hookSecret: "" },
		{ apiUrl: "http://example.com" },
		{ supabaseUrl: "https://user:pass@example.com" },
	]) {
		assert.throws(() => createHandler({ ...configuration, ...overrides }));
	}
});

Deno.test("a timeout followed by a pending replay stays an error until the send completes", async () => {
	const requests: Request[] = [];
	const handler = createHandler(configuration, (input, init) => {
		const request = new Request(input, init);
		requests.push(request);
		if (requests.length > 1) {
			return Promise.resolve(
				Response.json({
					success: true,
					status: requests.length === 2 ? "pending" : "sent",
				}),
			);
		}
		const { signal } = request;
		return new Promise((_resolve, reject) => {
			signal.addEventListener("abort", () => reject(signal.reason));
		});
	});
	assert.equal((await handler(signedRequest(payload()))).status, 502);
	assert.equal((await handler(signedRequest(payload()))).status, 502);
	assert.equal((await handler(signedRequest(payload()))).status, 200);
	assert.equal(
		new Set(requests.map((request) => request.headers.get("Idempotency-Key")))
			.size,
		1,
	);
});
