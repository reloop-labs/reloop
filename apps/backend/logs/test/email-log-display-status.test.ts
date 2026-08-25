import { describe, expect, test } from "bun:test";
import { deriveDisplayStatus } from "../src/lib/email-log-display-status";

describe("deriveDisplayStatus", () => {
	test("keeps delivery status when there is no engagement", () => {
		expect(deriveDisplayStatus("sent", [])).toBe("sent");
		expect(deriveDisplayStatus("delivered", [])).toBe("delivered");
		expect(deriveDisplayStatus("pending", ["sent"])).toBe("pending");
	});

	test("prefers clicked over opened over delivered", () => {
		expect(deriveDisplayStatus("delivered", ["opened"])).toBe("opened");
		expect(deriveDisplayStatus("delivered", ["opened", "clicked"])).toBe(
			"clicked",
		);
	});

	test("never overrides terminal failure with engagement", () => {
		expect(deriveDisplayStatus("failed", ["opened"])).toBe("failed");
		expect(deriveDisplayStatus("bounced", ["clicked"])).toBe("bounced");
		expect(deriveDisplayStatus("spam", ["opened"])).toBe("spam");
	});
});
