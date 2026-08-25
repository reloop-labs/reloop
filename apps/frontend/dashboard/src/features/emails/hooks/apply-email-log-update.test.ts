import { describe, expect, test } from "vitest";
import { applyEmailLogUpdate } from "./apply-email-log-update";
import type { EmailListResponse } from "./use-emails-query";

const list = (
	ids: Array<{ id: string; status: string }>,
): EmailListResponse => ({
	object: "list",
	data: ids.map((row) => ({
		id: row.id,
		subject: "Hello",
		fromEmail: "a@b.com",
		toEmails: ["c@d.com"],
		status: row.status,
		createdAt: "2026-08-26T00:00:00.000Z",
	})),
	total: ids.length,
	page: 1,
	limit: 10,
});

describe("applyEmailLogUpdate", () => {
	test("returns undefined when there is no cache", () => {
		expect(
			applyEmailLogUpdate(undefined, {
				id: "em_1",
				subject: "Hello",
				fromEmail: "a@b.com",
				toEmails: ["c@d.com"],
				status: "delivered",
				createdAt: "2026-08-26T00:00:00.000Z",
			}),
		).toBeUndefined();
	});

	test("patches status for a row already on the page", () => {
		const next = applyEmailLogUpdate(list([{ id: "em_1", status: "sent" }]), {
			id: "em_1",
			subject: "Hello",
			fromEmail: "a@b.com",
			toEmails: ["c@d.com"],
			status: "opened",
			createdAt: "2026-08-26T00:00:00.000Z",
		});
		expect(next?.data[0]?.status).toBe("opened");
		expect(next?.total).toBe(1);
	});

	test("prepends a new row on page 1", () => {
		const next = applyEmailLogUpdate(list([{ id: "em_1", status: "sent" }]), {
			id: "em_2",
			subject: "New",
			fromEmail: "a@b.com",
			toEmails: ["c@d.com"],
			status: "sent",
			createdAt: "2026-08-26T00:00:00.000Z",
		});
		expect(next?.data[0]?.id).toBe("em_2");
		expect(next?.total).toBe(2);
	});

	test("does not prepend onto later pages", () => {
		const current: EmailListResponse = {
			...list([{ id: "em_1", status: "sent" }]),
			page: 2,
		};
		const next = applyEmailLogUpdate(current, {
			id: "em_2",
			subject: "New",
			fromEmail: "a@b.com",
			toEmails: ["c@d.com"],
			status: "sent",
			createdAt: "2026-08-26T00:00:00.000Z",
		});
		expect(next).toBe(current);
	});
});
