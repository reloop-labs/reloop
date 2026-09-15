import { describe, expect, it } from "vitest";
import {
	getAudienceIcon,
	getStatusColorClass,
	getStatusIcon,
	getStatusLabel,
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
