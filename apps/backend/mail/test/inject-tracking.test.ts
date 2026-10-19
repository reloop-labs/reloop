import { describe, expect, test } from "bun:test";
import {
	injectCustomTracking_step5c,
	injectTracking_step5b,
} from "../src/routes/mail/send-email/steps";

const html =
	'<html><body><a href="https://example.com/a?x=1&amp;y=2">Read</a></body></html>';

describe("tracking injection", () => {
	test("keeps original links when click and open tracking are off", () => {
		expect(
			injectTracking_step5b({
				html,
				emailLogId: "log_1",
				clickTracking: false,
				openTracking: false,
			}),
		).toBe(html);
	});

	test("keeps original links when only open tracking is on", () => {
		for (const out of [
			injectTracking_step5b({
				html,
				emailLogId: "log_1",
				clickTracking: false,
				openTracking: true,
			}),
			injectCustomTracking_step5c({
				html,
				emailLogId: "log_1",
				clickTracking: false,
				openTracking: true,
				trackingDomain: "link.example.com",
			}),
		]) {
			expect(out).toContain('href="https://example.com/a?x=1&amp;y=2"');
			expect(out).not.toContain("/redirect/");
			expect(out).toContain("/track/open/");
		}
	});

	test("wraps links when click tracking is on", () => {
		const out = injectTracking_step5b({
			html,
			emailLogId: "log_1",
			clickTracking: true,
			openTracking: false,
		});
		expect(out).toContain("/redirect/");
		expect(out).not.toContain('href="https://example.com/a');
	});
});
