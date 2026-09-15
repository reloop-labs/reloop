import { describe, expect, test } from "vitest";
import { emailSendVia, emailSendViaListLabel } from "./email-send-via";

describe("emailSendVia", () => {
	test("campaign uses the campaign name as the underlined link", () => {
		expect(
			emailSendVia({
				source: "campaign",
				origin: { type: "campaign", id: "cmp_1", name: "June launch" },
			}),
		).toEqual({
			label: "June launch",
			icon: "mega-phone",
			href: "/campaigns/cmp_1",
		});
	});

	test("automation uses the workflow name as the link", () => {
		expect(
			emailSendVia({
				source: "automation",
				origin: { type: "automation", id: "auto_1", name: "Welcome" },
			}),
		).toEqual({
			label: "Welcome",
			icon: "workflow",
			href: "/automation/auto_1",
		});
	});

	test("api and smtp are both transactional", () => {
		expect(emailSendVia({ source: "transactional" })).toEqual({
			label: "Transactional",
			icon: "code",
		});
		expect(emailSendVia({ source: "smtp" })).toEqual({
			label: "Transactional",
			icon: "mail-send",
		});
		expect(emailSendVia({})).toEqual({
			label: "Transactional",
			icon: "code",
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
