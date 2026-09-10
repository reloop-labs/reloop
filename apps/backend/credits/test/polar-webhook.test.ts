import { describe, expect, test } from "bun:test";
import { Webhook } from "standardwebhooks";
import { verifyPolarWebhook, WebhookVerificationError } from "../src/lib/polar";

const HMAC_SECRET = "reloop-polar-hmac-secret";
const STANDARD_SECRET = `whsec_${Buffer.from("reloop-polar-std-secret").toString("base64")}`;
const BODY = JSON.stringify({
	type: "subscription.updated",
	data: { id: "sub_1", status: "active" },
});

function sign(body: string, librarySecret: string) {
	const id = "msg_1";
	const timestamp = new Date();
	const signature = new Webhook(librarySecret).sign(id, timestamp, body);
	return {
		"webhook-id": id,
		"webhook-timestamp": Math.floor(timestamp.getTime() / 1000).toString(),
		"webhook-signature": signature,
	};
}

describe("verifyPolarWebhook", () => {
	test("accepts Polar HMAC signatures used by @polar-sh/sdk 0.49", () => {
		const headers = sign(
			BODY,
			Buffer.from(HMAC_SECRET, "utf-8").toString("base64"),
		);
		const event = verifyPolarWebhook({
			body: BODY,
			headers,
			secret: HMAC_SECRET,
		});
		expect(event.type).toBe("subscription.updated");
		expect(event.data.id).toBe("sub_1");
	});

	test("accepts Standard Webhooks signatures Polar uses for secrets after 8 Sep 2026", () => {
		const headers = sign(BODY, STANDARD_SECRET);
		const event = verifyPolarWebhook({
			body: BODY,
			headers,
			secret: STANDARD_SECRET,
		});
		expect(event.type).toBe("subscription.updated");
		expect(event.data.id).toBe("sub_1");
	});

	test("rejects a mismatched secret", () => {
		const headers = sign(BODY, STANDARD_SECRET);
		expect(() =>
			verifyPolarWebhook({
				body: BODY,
				headers,
				secret: "another-secret",
			}),
		).toThrow(WebhookVerificationError);
	});

	test("rejects an empty secret instead of skipping verification", () => {
		const headers = sign(BODY, STANDARD_SECRET);
		expect(() =>
			verifyPolarWebhook({
				body: BODY,
				headers,
				secret: "  ",
			}),
		).toThrow(WebhookVerificationError);
	});
});
