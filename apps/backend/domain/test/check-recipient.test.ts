import { describe, expect, test, mock } from "bun:test";
import { checkRecipientController } from "../src/routes/kumomta/check-recipient/check-recipient.controllers";
import { db } from "@reloop/db/client";

describe("checkRecipientController", () => {
	test("returns allowed=true for exact active mailbox match", async () => {
		const originalFindFirst = db.query.mailbox.findFirst;
		// @ts-ignore
		db.query.mailbox.findFirst = mock(async ({ where }: any) => {
			return { id: "mbx_123" };
		});

		try {
			const result = await checkRecipientController("hello@example.com");
			expect(result.allowed).toBe(true);
		} finally {
			db.query.mailbox.findFirst = originalFindFirst;
		}
	});

	test("returns allowed=true for plus-addressed alias when base mailbox exists", async () => {
		const originalFindFirst = db.query.mailbox.findFirst;
		let queryCount = 0;
		// @ts-ignore
		db.query.mailbox.findFirst = mock(async () => {
			queryCount++;
			// First lookup for "hello+tag@example.com" returns null
			if (queryCount === 1) return null;
			// Second lookup for base "hello@example.com" returns mailbox
			return { id: "mbx_123" };
		});

		try {
			const result = await checkRecipientController("hello+newsletter@example.com");
			expect(result.allowed).toBe(true);
			expect(queryCount).toBe(2);
		} finally {
			db.query.mailbox.findFirst = originalFindFirst;
		}
	});

	test("returns allowed=false when neither exact nor base mailbox exists", async () => {
		const originalFindFirst = db.query.mailbox.findFirst;
		// @ts-ignore
		db.query.mailbox.findFirst = mock(async () => {
			return null;
		});

		try {
			const result = await checkRecipientController("unknown+tag@example.com");
			expect(result.allowed).toBe(false);
		} finally {
			db.query.mailbox.findFirst = originalFindFirst;
		}
	});
});
