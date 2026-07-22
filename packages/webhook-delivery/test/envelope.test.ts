import { describe, expect, test } from "bun:test";
import {
	buildWebhookEnvelope,
	serializeWebhookEnvelope,
	signWebhookBody,
	verifyWebhookSignature,
	formatSignatureHeader,
} from "../src/index";

describe("envelope + sign roundtrip", () => {
	test("serialized body is what gets signed", () => {
		const envelope = buildWebhookEnvelope({
			id: "whev_test",
			type: "email.delivered",
			createdAt: new Date("2026-07-22T12:00:00.000Z"),
			data: {
				email_id: "em_1",
				from: "a@b.com",
				to: ["c@d.com"],
				subject: "Hi",
				status: "delivered",
			},
		});
		expect(envelope).toEqual({
			id: "whev_test",
			type: "email.delivered",
			created_at: "2026-07-22T12:00:00.000Z",
			data: {
				email_id: "em_1",
				from: "a@b.com",
				to: ["c@d.com"],
				subject: "Hi",
				status: "delivered",
			},
		});

		const raw = serializeWebhookEnvelope(envelope);
		const ts = 1_784_700_000;
		const secret = "whsec_roundtrip";
		const sig = signWebhookBody(secret, raw, ts);
		expect(
			verifyWebhookSignature({
				secret,
				rawBody: raw,
				signatureHeader: formatSignatureHeader(ts, sig),
				nowSeconds: ts,
			}),
		).toBe(true);
	});
});
