import { describe, expect, test } from "bun:test";
import {
	HEADER_SIGNATURE,
	buildDeliveryHeaders,
	formatSignatureHeader,
	signWebhookBody,
	verifyWebhookSignature,
} from "../src/index";

describe("signWebhookBody", () => {
	test("produces stable HMAC for known input", () => {
		const secret = "whsec_test_secret";
		const body = '{"id":"whev_1","type":"email.sent","created_at":"2026-01-01T00:00:00.000Z","data":{}}';
		const ts = 1_700_000_000;
		const sig = signWebhookBody(secret, body, ts);
		expect(sig).toHaveLength(64);
		expect(sig).toBe(signWebhookBody(secret, body, ts));
		expect(sig).not.toBe(signWebhookBody(secret, body, ts + 1));
	});
});

describe("verifyWebhookSignature", () => {
	test("accepts valid signature within tolerance", () => {
		const secret = "whsec_abc";
		const body = '{"hello":"world"}';
		const ts = 1_700_000_000;
		const v1 = signWebhookBody(secret, body, ts);
		const header = formatSignatureHeader(ts, v1);
		expect(
			verifyWebhookSignature({
				secret,
				rawBody: body,
				signatureHeader: header,
				nowSeconds: ts + 10,
			}),
		).toBe(true);
	});

	test("rejects wrong secret", () => {
		const body = '{"hello":"world"}';
		const ts = 1_700_000_000;
		const v1 = signWebhookBody("whsec_a", body, ts);
		expect(
			verifyWebhookSignature({
				secret: "whsec_b",
				rawBody: body,
				signatureHeader: formatSignatureHeader(ts, v1),
				nowSeconds: ts,
			}),
		).toBe(false);
	});

	test("rejects expired timestamp", () => {
		const secret = "whsec_abc";
		const body = "{}";
		const ts = 1_700_000_000;
		const v1 = signWebhookBody(secret, body, ts);
		expect(
			verifyWebhookSignature({
				secret,
				rawBody: body,
				signatureHeader: formatSignatureHeader(ts, v1),
				nowSeconds: ts + 10_000,
				toleranceSeconds: 300,
			}),
		).toBe(false);
	});
});

describe("buildDeliveryHeaders", () => {
	test("signature headers win over custom headers", () => {
		const headers = buildDeliveryHeaders({
			eventId: "whev_1",
			timestampSeconds: 123,
			signatureHex: "abc",
			customHeaders: {
				"Reloop-Signature": "forged",
				"Content-Type": "text/plain",
				"X-Custom": "ok",
			},
		});
		expect(headers[HEADER_SIGNATURE]).toBe("t=123,v1=abc");
		expect(headers["Content-Type"]).toBe("application/json");
		expect(headers["X-Custom"]).toBe("ok");
	});
});
