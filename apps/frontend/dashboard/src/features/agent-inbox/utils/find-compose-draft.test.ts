import { describe, expect, it } from "vitest";
import { findComposeDraft } from "./find-compose-draft";
import type { ComposeDraft } from "../types";

const base = {
	mailboxId: "mb_1",
	to: [] as string[],
	cc: [] as string[],
	bcc: [] as string[],
	subject: "",
	html: "",
	text: "",
	attachments: [] as ComposeDraft["attachments"],
	createdAt: "2026-07-18T10:00:00.000Z",
	updatedAt: "2026-07-18T10:00:00.000Z",
	inReplyToMessageId: null as string | null,
};

describe("findComposeDraft", () => {
	it("returns the matching reply draft for a thread", () => {
		const drafts: ComposeDraft[] = [
			{
				...base,
				id: "a",
				kind: "compose",
				threadId: null,
			},
			{
				...base,
				id: "b",
				kind: "reply",
				threadId: "thr_1",
				text: "draft reply",
			},
		];
		const found = findComposeDraft(drafts, {
			mailboxId: "mb_1",
			threadId: "thr_1",
			kind: "reply",
		});
		expect(found?.id).toBe("b");
		expect(found?.text).toBe("draft reply");
	});

	it("returns null when kind or thread does not match", () => {
		const drafts: ComposeDraft[] = [
			{
				...base,
				id: "b",
				kind: "reply",
				threadId: "thr_1",
			},
		];
		expect(
			findComposeDraft(drafts, {
				mailboxId: "mb_1",
				threadId: "thr_1",
				kind: "forward",
			}),
		).toBeNull();
	});
});
