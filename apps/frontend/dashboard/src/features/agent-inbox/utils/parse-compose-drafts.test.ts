import { describe, expect, it } from "vitest";
import {
	parseComposeDraft,
	parseComposeDraftsList,
} from "./parse-compose-drafts";

const sample = {
	id: "cdrft_1",
	mailboxId: "mb_1",
	kind: "reply",
	threadId: "thr_1",
	inReplyToMessageId: "msg_1",
	to: ["a@example.com"],
	cc: [],
	bcc: [],
	subject: "Re: Hello",
	html: "<p>hi</p>",
	text: "hi",
	attachments: [],
	createdAt: "2026-07-18T10:00:00.000Z",
	updatedAt: "2026-07-18T10:05:00.000Z",
};

describe("parseComposeDraftsList", () => {
	it("accepts a bare array from the API", () => {
		const drafts = parseComposeDraftsList([sample]);
		expect(drafts).toHaveLength(1);
		expect(drafts[0]?.id).toBe("cdrft_1");
		expect(drafts[0]?.kind).toBe("reply");
		expect(drafts[0]?.threadId).toBe("thr_1");
	});

	it("accepts { drafts: [...] } wrappers", () => {
		const drafts = parseComposeDraftsList({ drafts: [sample] });
		expect(drafts).toHaveLength(1);
		expect(drafts[0]?.mailboxId).toBe("mb_1");
	});

	it("returns [] for invalid payloads", () => {
		expect(parseComposeDraftsList(null)).toEqual([]);
		expect(parseComposeDraftsList({})).toEqual([]);
		expect(parseComposeDraftsList("nope")).toEqual([]);
	});
});

describe("parseComposeDraft", () => {
	it("defaults kind to compose and nulls missing thread fields", () => {
		const draft = parseComposeDraft({
			id: "cdrft_2",
			mailboxId: "mb_1",
			to: [],
			cc: [],
			bcc: [],
			subject: "",
			html: "",
			text: "",
			attachments: [],
			createdAt: "2026-07-18T10:00:00.000Z",
			updatedAt: "2026-07-18T10:00:00.000Z",
		});
		expect(draft?.kind).toBe("compose");
		expect(draft?.threadId).toBeNull();
		expect(draft?.inReplyToMessageId).toBeNull();
	});

	it("reads snake_case thread fields", () => {
		const draft = parseComposeDraft({
			id: "cdrft_3",
			mailbox_id: "mb_1",
			kind: "forward",
			thread_id: "thr_9",
			in_reply_to_message_id: "msg_9",
			to: [],
			cc: [],
			bcc: [],
			subject: "Fwd:",
			html: "",
			text: "",
			attachments: [],
			created_at: "2026-07-18T10:00:00.000Z",
			updated_at: "2026-07-18T10:00:00.000Z",
		});
		expect(draft?.mailboxId).toBe("mb_1");
		expect(draft?.threadId).toBe("thr_9");
		expect(draft?.inReplyToMessageId).toBe("msg_9");
		expect(draft?.kind).toBe("forward");
	});
});
