import { describe, expect, it } from "bun:test";
import { getDomainConnectParts } from "@reloop/domain/utils/domain-connect-parts";

describe("Domain Connect Parts Splitter", () => {
	it("should split a 3-part subdomain correctly", () => {
		const result = getDomainConnectParts("send.example.com");
		expect(result.domain).toBe("example.com");
		expect(result.host).toBe("send");
	});

	it("should split a 4-part subdomain correctly", () => {
		const result = getDomainConnectParts("mail.send.example.com");
		expect(result.domain).toBe("example.com");
		expect(result.host).toBe("mail.send");
	});

	it("should return empty host for apex domains", () => {
		const result = getDomainConnectParts("example.com");
		expect(result.domain).toBe("example.com");
		expect(result.host).toBe("");
	});

	it("should handle single word inputs fallback", () => {
		const result = getDomainConnectParts("localhost");
		expect(result.domain).toBe("localhost");
		expect(result.host).toBe("");
	});
});
