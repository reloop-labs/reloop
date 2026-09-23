import { describe, expect, test } from "bun:test";
import {
	assertAttachmentsWithinPlan,
	assertInjectPayloadWithinLimit,
	estimateAttachmentBytes,
	KUMO_INJECT_PAYLOAD_LIMIT_BYTES,
} from "../src/lib/size-gate";

const MB = 1024 * 1024;

describe("estimateAttachmentBytes", () => {
	test("estimates base64 content at decoded size", () => {
		const raw = Buffer.alloc(3000).toString("base64");
		const estimated = estimateAttachmentBytes({ content: raw });
		expect(estimated).toBe(3000);
	});

	test("measures plain text as utf8", () => {
		expect(estimateAttachmentBytes({ content: "hello" })).toBe(5);
	});

	test("measures buffers directly", () => {
		expect(estimateAttachmentBytes({ content: Buffer.alloc(100) })).toBe(100);
	});

	test("returns null for path attachments (verified post-materialize)", () => {
		expect(
			estimateAttachmentBytes({ path: "uploads/2026/08/a.pdf" }),
		).toBeNull();
	});
});

describe("assertAttachmentsWithinPlan", () => {
	test("passes small attachments", () => {
		const { totalEstimated } = assertAttachmentsWithinPlan(
			[{ filename: "a.txt", content: "hi" }],
			1 * MB,
			"free",
		);
		expect(totalEstimated).toBe(2);
	});

	test("rejects a single file over the plan limit with 413", () => {
		const big = Buffer.alloc(2 * MB).toString("base64");
		expect(() =>
			assertAttachmentsWithinPlan(
				[{ filename: "big.pdf", content: big }],
				1 * MB,
				"free",
			),
		).toThrow(expect.objectContaining({ status: 413 }));
	});

	test("rejects combined total over the plan limit", () => {
		const each = Buffer.alloc(600 * 1024).toString("base64");
		expect(() =>
			assertAttachmentsWithinPlan(
				[
					{ filename: "a.pdf", content: each },
					{ filename: "b.pdf", content: each },
				],
				1 * MB,
				"free",
			),
		).toThrow(expect.objectContaining({ status: 413 }));
	});

	test("allows paid-limit files", () => {
		const fourMb = Buffer.alloc(4 * MB).toString("base64");
		const { totalEstimated } = assertAttachmentsWithinPlan(
			[{ filename: "deck.pdf", content: fourMb }],
			5 * MB,
			"individual",
		);
		expect(totalEstimated).toBe(4 * MB);
	});
});

describe("assertInjectPayloadWithinLimit", () => {
	test("rejects wire payloads over the Kumo ceiling", () => {
		expect(() =>
			assertInjectPayloadWithinLimit(KUMO_INJECT_PAYLOAD_LIMIT_BYTES + 1),
		).toThrow(expect.objectContaining({ status: 413 }));
	});

	test("passes payloads under the ceiling", () => {
		expect(() =>
			assertInjectPayloadWithinLimit(KUMO_INJECT_PAYLOAD_LIMIT_BYTES - 1),
		).not.toThrow();
	});
});
