import { describe, expect, it } from "vitest";
import {
	getAudienceIcon,
	getStatusColorClass,
	getStatusIcon,
	getStatusLabel,
	isEditableStatus,
	nextSlot,
} from "./utils";

describe("campaign utils", () => {
	describe("getAudienceIcon", () => {
		it("returns 'modules' for group", () => {
			expect(getAudienceIcon("group")).toBe("modules");
		});

		it("returns 'notification-indicator' for channel (topics)", () => {
			expect(getAudienceIcon("channel")).toBe("notification-indicator");
		});

		it("returns 'file-text' for csv", () => {
			expect(getAudienceIcon("csv")).toBe("file-text");
		});

		it("returns 'contacts' for all or undefined", () => {
			expect(getAudienceIcon("all")).toBe("contacts");
			expect(getAudienceIcon(undefined)).toBe("contacts");
		});
	});

	describe("getStatusColorClass", () => {
		it("returns correct color classes", () => {
			expect(getStatusColorClass("scheduled")).toBe("text-warning-base");
			expect(getStatusColorClass("sending")).toBe("text-blue-500");
			expect(getStatusColorClass("sent")).toBe("text-success-base");
			expect(getStatusColorClass("cancelled")).toBe("text-error-base");
			expect(getStatusColorClass("draft")).toBe("text-text-sub-600");
		});
	});

	describe("getStatusLabel", () => {
		it("returns correct labels", () => {
			expect(getStatusLabel("draft")).toBe("Draft");
			expect(getStatusLabel("scheduled")).toBe("Scheduled");
			expect(getStatusLabel("sending")).toBe("Sending");
			expect(getStatusLabel("sent")).toBe("Sent");
			expect(getStatusLabel("cancelled")).toBe("Cancelled");
		});
	});

	describe("getStatusIcon", () => {
		it("returns correct status icons", () => {
			expect(getStatusIcon("draft")).toBe("minus-circle");
			expect(getStatusIcon("scheduled")).toBe("time");
			expect(getStatusIcon("sending")).toBe("refresh-cw");
			expect(getStatusIcon("sent")).toBe("check-circle");
			expect(getStatusIcon("cancelled")).toBe("cross-circle");
		});
	});
});

describe("nextSlot", () => {
	// Wednesday 29 Oct 2026, 10:00 local time.
	const now = new Date(2026, 9, 28, 10, 0, 0);

	it("picks the coming weekday at the hour", () => {
		const slot = nextSlot(6, 9, now); // Sunday 9 AM
		expect(slot.getDay()).toBe(0);
		expect(slot.getHours()).toBe(9);
		expect(slot.getDate()).toBe(1); // Sun 1 Nov
	});

	it("later today stays today", () => {
		const slot = nextSlot(2, 18, now); // Wednesday 6 PM
		expect(slot.getDate()).toBe(28);
		expect(slot.getHours()).toBe(18);
	});

	it("a time already past today moves to next week", () => {
		const slot = nextSlot(2, 9, now); // Wednesday 9 AM, an hour ago
		expect(slot.getDate()).toBe(4); // Wed 4 Nov
	});

	it("a slot starting within minutes moves to next week", () => {
		const almost = new Date(2026, 9, 28, 8, 58, 0);
		expect(nextSlot(2, 9, almost).getDate()).toBe(4);
	});
});

describe("isEditableStatus", () => {
	it("allows drafts and scheduled campaigns, not ones that started", () => {
		expect(isEditableStatus("draft")).toBe(true);
		expect(isEditableStatus("scheduled")).toBe(true);
		expect(isEditableStatus("sending")).toBe(false);
		expect(isEditableStatus("sent")).toBe(false);
		expect(isEditableStatus(undefined)).toBe(false);
	});
});
