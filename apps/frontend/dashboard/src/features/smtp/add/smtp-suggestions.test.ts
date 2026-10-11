import { describe, expect, test } from "bun:test";
import {
	domainSuggestions,
	hostSuggestions,
	presetForHost,
} from "./smtp-suggestions";

const values = (list: { value: string }[]) => list.map((s) => s.value);

describe("domainSuggestions", () => {
	test("appends common TLDs to a bare name", () => {
		expect(values(domainSuggestions("acme", [])).slice(0, 3)).toEqual([
			"acme.com",
			"acme.io",
			"acme.co",
		]);
	});

	test("completes a partial TLD", () => {
		expect(values(domainSuggestions("acme.c", []))).toEqual([
			"acme.com",
			"acme.co",
			"acme.co.uk",
		]);
	});

	test("appends TLDs to subdomains", () => {
		expect(values(domainSuggestions("send.acme", []))[0]).toBe("send.acme.com");
	});

	test("lists the org's matching domains first", () => {
		const list = domainSuggestions("acme", ["acme.dev", "other.io"]);
		expect(list[0]).toEqual({ value: "acme.dev", group: "Your domains" });
		expect(values(list)).not.toContain("other.io");
	});

	test("ignores junk input", () => {
		expect(domainSuggestions("a b", [])).toEqual([]);
	});
});

describe("hostSuggestions", () => {
	test("matches providers by name or host", () => {
		expect(values(hostSuggestions("sendg", ""))).toEqual(["smtp.sendgrid.net"]);
		expect(values(hostSuggestions("office365", ""))).toEqual([
			"smtp.office365.com",
		]);
	});

	test("offers the domain's own mail hosts first", () => {
		expect(values(hostSuggestions("", "acme.com")).slice(0, 2)).toEqual([
			"smtp.acme.com",
			"mail.acme.com",
		]);
	});

	test("finds a preset with its fixed login", () => {
		expect(presetForHost("smtp.sendgrid.net")?.username).toBe("apikey");
		expect(presetForHost("smtp.acme.com")).toBeUndefined();
	});
});
