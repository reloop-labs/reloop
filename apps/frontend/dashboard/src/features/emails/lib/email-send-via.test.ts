import { describe, expect, test } from "vitest";
import { emailSendVia, emailSendViaListLabel } from "./email-send-via";

describe("emailSendVia", () => {
	test("campaign links to the campaign by name", () => {
		expect(
			emailSendVia({
				source: "campaign",
				origin: { type: "campaign", id: "cmp_1", name: "June launch" },
			}),
		).toEqual({
			label: "Campaign",
			channel: "June launch",
			href: "/campaigns/cmp_1",
		});
	});

	test("automation links to the workflow", () => {
		expect(
			emailSendVia({
				source: "automation",
				origin: { type: "automation", id: "auto_1", name: "Welcome" },
			}),
		).toEqual({
			label: "Automation",
			channel: "Welcome",
			href: "/automation/auto_1",
		});
	});

	test("api and smtp are both transactional", () => {
		expect(emailSendVia({ source: "transactional" })).toEqual({
			label: "Transactional",
			channel: "API",
		});
		expect(emailSendVia({ source: "smtp" })).toEqual({
			label: "Transactional",
			channel: "SMTP",
		});
		expect(emailSendVia({})).toEqual({
			label: "Transactional",
			channel: "API",
		});
	});
});

describe("emailSendViaListLabel", () => {
	test("uses short labels for the table", () => {
		expect(emailSendViaListLabel("campaign")).toBe("Campaign");
		expect(emailSendViaListLabel("transactional")).toBe("Transactional");
		expect(emailSendViaListLabel("smtp")).toBe("SMTP");
		expect(emailSendViaListLabel("automation")).toBe("Automation");
	});
});
