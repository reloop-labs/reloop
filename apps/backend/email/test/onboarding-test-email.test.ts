import { describe, expect, test } from "bun:test";
import {
	ONBOARDING_TEST_SUBJECT,
	ONBOARDING_TEST_SUBJECTS,
} from "../src/routes/onboarding/onboarding.constants";
import { buildOnboardingTestEmail } from "../src/routes/onboarding/onboarding-test-email";

const sentAt = new Date("2026-10-12T17:19:56Z");

describe("onboarding test email", () => {
	test("names the recipient, sender and send time", () => {
		const email = buildOnboardingTestEmail({
			to: "mateusz@fumocode.com",
			from: "onboarding@reloop.email",
			name: "Mateusz Kowalski",
			sentAt,
		});

		expect(email.subject).toBe(ONBOARDING_TEST_SUBJECT);
		expect(email.text).toStartWith("Hi Mateusz,");
		expect(email.text).toContain("mateusz@fumocode.com");
		expect(email.text).toContain("onboarding@reloop.email");
		expect(email.text).toContain("2026-10-12 17:19 UTC");
		expect(email.html).toContain("<p");
		expect(email.html).not.toBe(email.text);
	});

	test("escapes the user's name in html", () => {
		const email = buildOnboardingTestEmail({
			to: "a@b.test",
			from: "onboarding@reloop.email",
			name: "<script>x</script>",
			sentAt,
		});
		expect(email.html).not.toContain("<script>");
		expect(email.html).toContain("&lt;script&gt;x&lt;/script&gt;,");
	});

	test("greets without a name", () => {
		const email = buildOnboardingTestEmail({
			to: "a@b.test",
			from: "onboarding@reloop.email",
			sentAt,
		});
		expect(email.text).toStartWith("Hi,");
	});

	test("still matches sends logged under the old subject", () => {
		expect(ONBOARDING_TEST_SUBJECTS).toContain("Hello World!");
	});
});
