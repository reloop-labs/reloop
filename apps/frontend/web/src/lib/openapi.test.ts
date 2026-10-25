import { describe, expect, test } from "bun:test";
import { supportsIdempotencyKey } from "@reloop/web/lib/openapi";

describe("supportsIdempotencyKey", () => {
	test("covers write services and skips secret-returning creates", () => {
		expect(supportsIdempotencyKey("/api/mail/v1/send")).toBe(true);
		expect(supportsIdempotencyKey("/api/contacts/create")).toBe(true);
		expect(supportsIdempotencyKey("/api/webhook/v1/")).toBe(false);
		expect(supportsIdempotencyKey("/api/inbox/v1/webhooks/")).toBe(false);
		expect(supportsIdempotencyKey("/api/api-key/v1/")).toBe(false);
		expect(supportsIdempotencyKey("/api/tools/v1/spam-check")).toBe(false);
	});
});
