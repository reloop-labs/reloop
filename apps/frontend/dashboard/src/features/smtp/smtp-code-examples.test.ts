import { describe, expect, it } from "vitest";
import {
	buildSmtpCodeExamples,
	DEFAULT_SMTP_HOST,
	SMTP_LANGUAGES,
} from "./smtp-code-examples";

const SELF_HOSTED = "mail.acme.example";

describe("buildSmtpCodeExamples", () => {
	it("uses the configured host in every language example", () => {
		const examples = buildSmtpCodeExamples("YOUR_API_KEY", SELF_HOSTED);

		for (const { id } of SMTP_LANGUAGES) {
			expect(examples[id]).toContain(SELF_HOSTED);
			expect(examples[id]).not.toContain(DEFAULT_SMTP_HOST);
		}
	});

	it("covers every advertised language", () => {
		const examples = buildSmtpCodeExamples("YOUR_API_KEY", SELF_HOSTED);
		expect(Object.keys(examples).sort()).toEqual(
			SMTP_LANGUAGES.map((l) => l.id).sort(),
		);
	});

	it("falls back to the Reloop Cloud host when none is configured", () => {
		const examples = buildSmtpCodeExamples();
		for (const { id } of SMTP_LANGUAGES) {
			expect(examples[id]).toContain(DEFAULT_SMTP_HOST);
		}
	});

	it("ignores an empty host rather than emitting a blank server", () => {
		const examples = buildSmtpCodeExamples("YOUR_API_KEY", "");
		for (const { id } of SMTP_LANGUAGES) {
			expect(examples[id]).not.toMatch(/host:\s*["']["']/);
		}
	});
});
