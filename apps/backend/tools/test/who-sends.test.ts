import { describe, expect, it } from "bun:test";
import {
	identifySenders,
	mapDkimSelectorToVendor,
	mapSpfIncludeToVendor,
} from "@be/tools/routes/tools/who-sends/who-sends.service";

describe("Who Sends Email Service (Sender Fingerprint)", () => {
	describe("mapSpfIncludeToVendor", () => {
		it("maps known vendors accurately", () => {
			expect(mapSpfIncludeToVendor("_spf.google.com")?.name).toBe("Google Workspace");
			expect(mapSpfIncludeToVendor("spf.protection.outlook.com")?.name).toBe("Microsoft 365");
			expect(mapSpfIncludeToVendor("amazonses.com")?.name).toBe("Amazon SES");
			expect(mapSpfIncludeToVendor("sendgrid.net")?.name).toBe("SendGrid");
			expect(mapSpfIncludeToVendor("servers.mcsv.net")?.name).toBe("Mailchimp");
			expect(mapSpfIncludeToVendor("reloop.sh")?.name).toBe("Reloop");
			expect(mapSpfIncludeToVendor("spf.custom-unlisted.io")).toBeNull();
		});
	});

	describe("mapDkimSelectorToVendor & ambiguous s1 handling", () => {
		it("maps unambiguous selectors like google and k1", () => {
			expect(mapDkimSelectorToVendor("google", new Set()).vendor?.name).toBe("Google Workspace");
			expect(mapDkimSelectorToVendor("k1", new Set()).vendor?.name).toBe("Mailchimp");
			expect(mapDkimSelectorToVendor("ses", new Set()).vendor?.name).toBe("Amazon SES");
		});

		it("handles ambiguous s1 with SPF context", () => {
			// s1 with SendGrid in SPF -> SendGrid
			const sendgridSet = new Set(["SendGrid"]);
			expect(mapDkimSelectorToVendor("s1", sendgridSet).vendor?.name).toBe("SendGrid");

			// s1 with Reloop in SPF -> Reloop
			const reloopSet = new Set(["Reloop"]);
			expect(mapDkimSelectorToVendor("s1", reloopSet).vendor?.name).toBe("Reloop");

			// s1 with neither in SPF -> null (ambiguous)
			expect(mapDkimSelectorToVendor("s1", new Set()).vendor).toBeNull();
		});
	});

	describe("identifySenders Pure Decision Tree", () => {
		it("Case 1: Classic split stack (Google Inbox + Amazon SES)", () => {
			const report = identifySenders({
				domain: "acme.com",
				inbox: {
					provider: "Google Workspace",
					exchanges: ["aspmx.l.google.com"],
				},
				spf: {
					published: true,
					qualifier: "~all",
					lookupCount: 2,
					includes: ["_spf.google.com", "amazonses.com"],
					ip4: [],
					ip6: [],
					rawRecord: "v=spf1 include:_spf.google.com include:amazonses.com ~all",
				},
				dkim: { published: false, selector: null, keyLength: null },
			});

			expect(report.verdict).toBe("split_stack");
			expect(report.headline).toContain("Google Workspace inbox");
			expect(report.headline).toContain("Amazon SES");
			expect(report.inbox.provider).toBe("Google Workspace");
			expect(report.senders.some((s) => s.vendor === "Amazon SES")).toBe(true);
		});

		it("Case 2: Single stack (Google only)", () => {
			const report = identifySenders({
				domain: "acme.com",
				inbox: {
					provider: "Google Workspace",
					exchanges: ["aspmx.l.google.com"],
				},
				spf: {
					published: true,
					qualifier: "~all",
					lookupCount: 1,
					includes: ["_spf.google.com"],
					ip4: [],
					ip6: [],
					rawRecord: "v=spf1 include:_spf.google.com ~all",
				},
				dkim: { published: true, selector: "google", keyLength: 2048 },
			});

			expect(report.verdict).toBe("single_stack");
			expect(report.headline).toContain("Google Workspace receives and sends this company’s mail");
		});

		it("Case 3: Single stack (Microsoft 365 only)", () => {
			const report = identifySenders({
				domain: "acme.com",
				inbox: {
					provider: "Microsoft 365",
					exchanges: ["acme-com.mail.protection.outlook.com"],
				},
				spf: {
					published: true,
					qualifier: "-all",
					lookupCount: 1,
					includes: ["spf.protection.outlook.com"],
					ip4: [],
					ip6: [],
					rawRecord: "v=spf1 include:spf.protection.outlook.com -all",
				},
				dkim: { published: true, selector: "selector1", keyLength: 2048 },
			});

			expect(report.verdict).toBe("single_stack");
			expect(report.headline).toContain("Microsoft 365 receives and sends this company’s mail");
		});

		it("Case 4: Crowded roster (6 services)", () => {
			const report = identifySenders({
				domain: "acme.com",
				inbox: {
					provider: "Google Workspace",
					exchanges: ["aspmx.l.google.com"],
				},
				spf: {
					published: true,
					qualifier: "~all",
					lookupCount: 6,
					includes: [
						"_spf.google.com",
						"amazonses.com",
						"sendgrid.net",
						"servers.mcsv.net",
						"zendesk.com",
						"hubspotemail.net",
					],
					ip4: [],
					ip6: [],
					rawRecord: "v=spf1 ...",
				},
				dkim: { published: true, selector: "google", keyLength: 2048 },
			});

			expect(report.verdict).toBe("crowded");
			expect(report.headline).toContain("6 services can send as acme.com");
			expect(report.senders.find((s) => s.vendor === "Mailchimp")?.leftover).toBe(true);
		});

		it("Case 5: Nested include unrolling", () => {
			const report = identifySenders({
				domain: "acme.com",
				inbox: { provider: "Google Workspace", exchanges: ["aspmx.l.google.com"] },
				spf: {
					published: true,
					qualifier: "~all",
					lookupCount: 1,
					includes: ["spf.acme.com"],
					ip4: [],
					ip6: [],
					rawRecord: "v=spf1 include:spf.acme.com ~all",
				},
				dkim: { published: false, selector: null, keyLength: null },
				nestedSpf: [
					{ originalHost: "spf.acme.com", nestedHost: "sendgrid.net" },
				],
			});

			expect(report.senders.some((s) => s.vendor === "SendGrid")).toBe(true);
			expect(report.senders.find((s) => s.vendor === "SendGrid")?.evidence[0]?.value).toContain(
				"spf.acme.com → sendgrid.net",
			);
		});

		it("Case 6: Flattened IPs (opaque)", () => {
			const report = identifySenders({
				domain: "acme.com",
				inbox: { provider: null, exchanges: [] },
				spf: {
					published: true,
					qualifier: "-all",
					lookupCount: 0,
					includes: [],
					ip4: ["203.0.113.10", "203.0.113.11"],
					ip6: [],
					rawRecord: "v=spf1 ip4:203.0.113.10 ip4:203.0.113.11 -all",
				},
				dkim: { published: false, selector: null, keyLength: null },
			});

			expect(report.verdict).toBe("opaque");
			expect(report.headline).toContain("Sending IPs are listed, but we can’t name the vendor");
			expect(report.unnamed.ip4.length).toBe(2);
		});

		it("Case 8: No SPF (unpublished)", () => {
			const report = identifySenders({
				domain: "newdomain.com",
				inbox: { provider: "Google Workspace", exchanges: ["aspmx.l.google.com"] },
				spf: {
					published: false,
					qualifier: null,
					lookupCount: 0,
					includes: [],
					ip4: [],
					ip6: [],
					rawRecord: null,
				},
				dkim: { published: false, selector: null, keyLength: null },
			});

			expect(report.verdict).toBe("unpublished");
			expect(report.headline).toContain("No sending policy");
		});

		it("Case 9: SPF +all (wide_open)", () => {
			const report = identifySenders({
				domain: "open.com",
				inbox: { provider: "Google Workspace", exchanges: ["aspmx.l.google.com"] },
				spf: {
					published: true,
					qualifier: "+all",
					lookupCount: 1,
					includes: ["_spf.google.com"],
					ip4: [],
					ip6: [],
					rawRecord: "v=spf1 include:_spf.google.com +all",
				},
				dkim: { published: false, selector: null, keyLength: null },
			});

			expect(report.verdict).toBe("wide_open");
			expect(report.headline).toContain("Anyone on the internet is authorized to send");
		});

		it("Case 15: No MX with SES send (send_only)", () => {
			const report = identifySenders({
				domain: "mail.acme.com",
				inbox: { provider: null, exchanges: [] },
				spf: {
					published: true,
					qualifier: "~all",
					lookupCount: 1,
					includes: ["amazonses.com"],
					ip4: [],
					ip6: [],
					rawRecord: "v=spf1 include:amazonses.com ~all",
				},
				dkim: { published: true, selector: "ses", keyLength: 2048 },
			});

			expect(report.verdict).toBe("send_only");
			expect(report.headline).toContain("Mail is sent via Amazon SES. This domain does not receive mail.");
		});
	});
});
