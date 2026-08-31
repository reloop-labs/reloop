import { describe, expect, it } from "bun:test";
import {
	classifyNameserverKind,
	classifyRdapHttp,
	evaluateColdDomain,
	parseRdapResponse,
	parseIanaRdapBootstrap,
	rdapEndpointsForDomain,
	rdapTldCandidates,
	toRegistrableDomain,
} from "@be/tools/routes/tools/domain-age/domain-age.service";

describe("Domain Age & Warmup Checker Service", () => {
	const frozenNow = new Date("2026-08-31T12:00:00.000Z");

	describe("Seam 1: toRegistrableDomain", () => {
		it("normalizes subdomains and URLs to registrable root", () => {
			expect(toRegistrableDomain("https://www.acme.com/blog").registrableDomain).toBe("acme.com");
			expect(toRegistrableDomain("mail.acme.co.uk").registrableDomain).toBe("acme.co.uk");
			expect(toRegistrableDomain("mail.acme.co.uk").tld).toBe("co.uk");
			expect(toRegistrableDomain("mail.reloop.sh").registrableDomain).toBe(
				"reloop.sh",
			);
			expect(toRegistrableDomain("xn--mnchen-3ya.de").registrableDomain).toBe("xn--mnchen-3ya.de");
		});

		it("throws on IP address inputs", () => {
			expect(() => toRegistrableDomain("8.8.8.8")).toThrow();
		});
	});

	describe("Seam 2: parseRdapResponse", () => {
		it("extracts creation date, expiration, registrar org, and status without leaking personal fields", () => {
			const fixture = {
				events: [
					{ eventAction: "registration", eventDate: "2026-08-27T00:00:00.000Z" },
					{ eventAction: "expiration", eventDate: "2027-08-27T00:00:00.000Z" },
					{ eventAction: "last changed", eventDate: "2026-08-28T00:00:00.000Z" },
				],
				status: ["clientTransferProhibited"],
				entities: [
					{
						roles: ["registrar"],
						vcardArray: [
							"vcard",
							[
								["version", {}, "text", "4.0"],
								["fn", {}, "text", "Namecheap, Inc."],
							],
						],
					},
					{
						roles: ["registrant"],
						vcardArray: [
							"vcard",
							[
								["fn", {}, "text", "John Doe Privacy Redacted"],
								["email", {}, "text", "private@privacy.com"],
							],
						],
					},
				],
				nameservers: [{ ldhName: "dns1.registrar-servers.com" }],
			};

			const parsed = parseRdapResponse(fixture);
			expect(parsed.found).toBe(true);
			expect(parsed.createdAt).toBe("2026-08-27T00:00:00.000Z");
			expect(parsed.expiresAt).toBe("2027-08-27T00:00:00.000Z");
			expect(parsed.registrar).toBe("Namecheap, Inc.");
			expect(parsed.nameservers[0]).toBe("dns1.registrar-servers.com");
			// ensure no personal leak
			expect((parsed as any).email).toBeUndefined();
		});
	});

	describe("Seam 3: evaluateColdDomain Decision Tree", () => {
		it("Case 1: Brand new domain (4 days old) -> too_new", () => {
			const report = evaluateColdDomain({
				domain: "acme.com",
				registrableDomain: "acme.com",
				now: frozenNow,
				rdap: {
					found: true,
					createdAt: "2026-08-27T12:00:00.000Z", // 4 days before 2026-08-31
					expiresAt: "2027-08-27T12:00:00.000Z",
					status: ["clientTransferProhibited"],
					registrar: "Namecheap",
					nameservers: ["dns1.registrar-servers.com"],
				},
				emailSetup: { spf: true, dmarc: true, dmarcPolicy: "reject", mx: true },
				nameservers: {
					hosts: ["dns1.registrar-servers.com"],
					provider: "Namecheap",
					kind: "registrar_default",
				},
			});

			expect(report.verdict).toBe("too_new");
			expect(report.headline).toBe("Too new to send — wait");
			expect(report.age.ageDays).toBe(4);
		});

		it("Case 2: Two weeks old (14 days) -> cold", () => {
			const report = evaluateColdDomain({
				domain: "acme.com",
				registrableDomain: "acme.com",
				now: frozenNow,
				rdap: {
					found: true,
					createdAt: "2026-08-17T12:00:00.000Z", // 14 days
					expiresAt: "2027-08-17T12:00:00.000Z",
					status: [],
					registrar: "Cloudflare",
					nameservers: ["ns1.cloudflare.com"],
				},
				emailSetup: { spf: true, dmarc: true, dmarcPolicy: "none", mx: true },
				nameservers: { hosts: ["ns1.cloudflare.com"], provider: "Cloudflare", kind: "production" },
			});

			expect(report.verdict).toBe("cold");
			expect(report.headline).toBe("Cold domain — send almost nothing");
		});

		it("Case 3: Two months old (45 days) -> warming", () => {
			const report = evaluateColdDomain({
				domain: "acme.com",
				registrableDomain: "acme.com",
				now: frozenNow,
				rdap: {
					found: true,
					createdAt: "2026-07-17T12:00:00.000Z", // 45 days
					expiresAt: "2027-07-17T12:00:00.000Z",
					status: [],
					registrar: "Google Domains",
					nameservers: [],
				},
				emailSetup: { spf: true, dmarc: true, dmarcPolicy: "quarantine", mx: true },
				nameservers: { hosts: [], provider: null, kind: "unknown" },
			});

			expect(report.verdict).toBe("warming");
			expect(report.headline).toBe("Warming — keep volume low");
		});

		it("Case 4: Four months old (120 days) -> established", () => {
			const report = evaluateColdDomain({
				domain: "acme.com",
				registrableDomain: "acme.com",
				now: frozenNow,
				rdap: {
					found: true,
					createdAt: "2026-05-03T12:00:00.000Z", // 120 days
					expiresAt: "2027-05-03T12:00:00.000Z",
					status: [],
					registrar: "GoDaddy",
					nameservers: [],
				},
				emailSetup: { spf: true, dmarc: true, dmarcPolicy: "reject", mx: true },
				nameservers: { hosts: [], provider: null, kind: "unknown" },
			});

			expect(report.verdict).toBe("established");
			expect(report.headline).toBe("Age is not the blocker");
		});

		it("Case 5: Ancient domain (>1 year) -> mature", () => {
			const report = evaluateColdDomain({
				domain: "google.com",
				registrableDomain: "google.com",
				now: frozenNow,
				rdap: {
					found: true,
					createdAt: "1997-09-15T00:00:00.000Z",
					expiresAt: "2028-09-14T00:00:00.000Z",
					status: ["clientTransferProhibited"],
					registrar: "MarkMonitor Inc.",
					nameservers: ["ns1.google.com"],
				},
				emailSetup: { spf: true, dmarc: true, dmarcPolicy: "reject", mx: true },
				nameservers: { hosts: ["ns1.google.com"], provider: "Google Cloud", kind: "production" },
			});

			expect(report.verdict).toBe("mature");
			expect(report.headline).toBe("This domain is old enough");
		});

		it("Case 6: Perfect DNS on 2-day-old domain -> stays too_new", () => {
			const report = evaluateColdDomain({
				domain: "brandnew.com",
				registrableDomain: "brandnew.com",
				now: frozenNow,
				rdap: {
					found: true,
					createdAt: "2026-08-29T12:00:00.000Z", // 2 days
					expiresAt: "2027-08-29T12:00:00.000Z",
					status: [],
					registrar: "Cloudflare",
					nameservers: [],
				},
				emailSetup: { spf: true, dmarc: true, dmarcPolicy: "reject", mx: true },
				nameservers: { hosts: [], provider: null, kind: "unknown" },
			});

			expect(report.verdict).toBe("too_new");
		});

		it("Case 8: RDAP 404 / Not registered -> not_registered", () => {
			const report = evaluateColdDomain({
				domain: "unregistered12345.com",
				registrableDomain: "unregistered12345.com",
				now: frozenNow,
				rdap: {
					found: false,
					createdAt: null,
					expiresAt: null,
					status: [],
					registrar: null,
					nameservers: [],
				},
				emailSetup: { spf: false, dmarc: false, dmarcPolicy: null, mx: false },
				nameservers: { hosts: [], provider: null, kind: "unknown" },
			});

			expect(report.verdict).toBe("not_registered");
			expect(report.headline).toBe("This domain isn’t registered");
		});

		it("does not treat a live domain as unregistered when RDAP 404s but DNS NS exist", () => {
			const report = evaluateColdDomain({
				domain: "reloop.sh",
				registrableDomain: "reloop.sh",
				now: frozenNow,
				rdap: {
					found: false,
					lookupStatus: "no_rdap_service",
					createdAt: null,
					expiresAt: null,
					status: [],
					registrar: null,
					nameservers: [],
				},
				emailSetup: { spf: true, dmarc: true, dmarcPolicy: "none", mx: true },
				nameservers: {
					hosts: ["elijah.ns.cloudflare.com", "leanna.ns.cloudflare.com"],
					provider: "Cloudflare",
					kind: "production",
				},
			});

			expect(report.verdict).not.toBe("not_registered");
			expect(report.verdict).toBe("unknown_age");
		});

		it("shows mature age for reloop.sh when Identity Digital RDAP returns the registration date", () => {
			const report = evaluateColdDomain({
				domain: "mail.reloop.sh",
				registrableDomain: "reloop.sh",
				now: frozenNow,
				rdap: {
					found: true,
					createdAt: "2025-07-03T06:17:03.176Z",
					expiresAt: "2027-07-03T06:17:03.176Z",
					status: ["client transfer prohibited"],
					registrar: "Spaceship, Inc.",
					nameservers: ["elijah.ns.cloudflare.com"],
				},
				emailSetup: { spf: true, dmarc: true, dmarcPolicy: "none", mx: true },
				nameservers: {
					hosts: ["elijah.ns.cloudflare.com"],
					provider: "Cloudflare",
					kind: "production",
				},
			});

			expect(report.verdict).toBe("mature");
			expect(report.age.ageDays).toBeGreaterThan(365);
			expect(report.registrableDomain).toBe("reloop.sh");
		});

		it("Case 9: ccTLD with no date -> unknown_age", () => {
			const report = evaluateColdDomain({
				domain: "example.de",
				registrableDomain: "example.de",
				now: frozenNow,
				rdap: {
					found: true,
					createdAt: null,
					expiresAt: null,
					status: ["connect"],
					registrar: "DENIC",
					nameservers: [],
				},
				emailSetup: { spf: true, dmarc: true, dmarcPolicy: "reject", mx: true },
				nameservers: { hosts: [], provider: null, kind: "unknown" },
			});

			expect(report.verdict).toBe("unknown_age");
			expect(report.headline).toBe("We can’t see this domain’s age");
		});

		it("Case 11: clientHold / Registry held -> held", () => {
			const report = evaluateColdDomain({
				domain: "suspended.com",
				registrableDomain: "suspended.com",
				now: frozenNow,
				rdap: {
					found: true,
					createdAt: "2020-01-01T00:00:00.000Z",
					expiresAt: "2027-01-01T00:00:00.000Z",
					status: ["clientHold", "serverHold"],
					registrar: "Namecheap",
					nameservers: [],
				},
				emailSetup: { spf: false, dmarc: false, dmarcPolicy: null, mx: false },
				nameservers: { hosts: [], provider: null, kind: "unknown" },
			});

			expect(report.verdict).toBe("held");
			expect(report.headline).toBe("Registry is holding this name");
		});

		it("Case 12: Expiring in 10 days -> adds warning", () => {
			const report = evaluateColdDomain({
				domain: "expiring.com",
				registrableDomain: "expiring.com",
				now: frozenNow,
				rdap: {
					found: true,
					createdAt: "2022-01-01T00:00:00.000Z",
					expiresAt: "2026-09-10T12:00:00.000Z", // 10 days after Aug 31
					status: [],
					registrar: "GoDaddy",
					nameservers: [],
				},
				emailSetup: { spf: true, dmarc: true, dmarcPolicy: "reject", mx: true },
				nameservers: { hosts: [], provider: null, kind: "unknown" },
			});

			expect(report.verdict).toBe("mature");
			expect(report.warnings.some((w) => w.includes("Domain expires in 10 days"))).toBe(true);
		});

		it("Case 20: Parking nameservers -> classifies kind as parking and adds warning", () => {
			expect(classifyNameserverKind(["ns1.sedoparking.com"])).toBe("parking");
		});
	});

	describe("RDAP worldwide TLD coverage", () => {
		it("queries Identity Digital before rdap.org for .sh and .io", () => {
			const sh = rdapEndpointsForDomain("reloop.sh");
			expect(sh[0]).toBe(
				"https://rdap.identitydigital.services/rdap/domain/reloop.sh",
			);
			expect(sh.some((url) => url.includes("rdap.org"))).toBe(true);

			const io = rdapEndpointsForDomain("github.io");
			expect(io[0]).toContain("rdap.identitydigital.services");
		});

		it("covers other country TLDs from the registry catalog, not only .sh", () => {
			expect(rdapEndpointsForDomain("bund.de")[0]).toContain("rdap.denic.de");
			expect(rdapEndpointsForDomain("gouv.fr")[0]).toContain("rdap.nic.fr");
			expect(rdapEndpointsForDomain("bbc.co.uk")[0]).toContain(
				"rdap.nominet.uk",
			);
			expect(rdapEndpointsForDomain("example.com.br")[0]).toContain(
				"rdap.registro.br",
			);
			expect(rdapEndpointsForDomain("example.co")[0]).toContain(
				"rdap.registry.co",
			);
			expect(rdapEndpointsForDomain("example.in")[0]).toContain(
				"rdap.registry.in",
			);
		});

		it("resolves co.uk to the parent uk registry", () => {
			expect(rdapTldCandidates("bbc.co.uk")).toEqual(["co.uk", "uk"]);
		});

		it("uses IANA bootstrap for gTLDs that are not in the ccTLD catalog", () => {
			const urls = rdapEndpointsForDomain("google.com", {
				bootstrap: { com: "https://rdap.verisign.com/com/v1/" },
			});
			expect(urls[0]).toBe(
				"https://rdap.verisign.com/com/v1/domain/google.com",
			);
			expect(urls.at(-1)).toContain("rdap.org");
		});

		it("guesses rdap.nic.{tld} when bootstrap and catalog have no entry", () => {
			const urls = rdapEndpointsForDomain("example.zz");
			expect(urls[0]).toBe("https://rdap.nic.zz/domain/example.zz");
		});

		it("parses IANA dns.json services into a TLD map", () => {
			const map = parseIanaRdapBootstrap({
				services: [
					[["com", "net"], ["https://rdap.verisign.com/com/v1/"]],
					[["app"], ["https://rdap.google/"]],
				],
			});
			expect(map.get("com")).toBe("https://rdap.verisign.com/com/v1/");
			expect(map.get("app")).toBe("https://rdap.google/");
		});

		it("does not treat rdap.org 'No RDAP service' 404 as an unregistered domain", () => {
			const parsed = classifyRdapHttp(404, {
				errorCode: 404,
				title: "No RDAP service is available for this resource",
			});
			expect(parsed.lookupStatus).toBe("no_rdap_service");
			expect(parsed.found).toBe(false);
		});

		it("treats a registry 404 as not_found", () => {
			const parsed = classifyRdapHttp(404, {
				rdapConformance: ["rdap_level_0"],
				errorCode: 404,
				title: "Object not found",
			});
			expect(parsed.lookupStatus).toBe("not_found");
			expect(parsed.found).toBe(false);
		});
	});
});
