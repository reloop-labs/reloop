import { describe, expect, it } from "bun:test";
import { createVerify, generateKeyPairSync } from "node:crypto";
import { signDomainConnectRequest } from "@reloop/domain/utils/domain-connect-signer";

describe("Domain Connect Request Signer", () => {
	it("should sign query strings using RSA-SHA256 and output base64url signatures", () => {
		// 1. Generate ephemeral RSA key pair for testing
		const { privateKey, publicKey } = generateKeyPairSync("rsa", {
			modulusLength: 2048,
			publicKeyEncoding: { type: "spki", format: "pem" },
			privateKeyEncoding: { type: "pkcs8", format: "pem" },
		});

		const queryString =
			"domain=example.com&host=send&domainKey=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA";

		// 2. Sign query string
		const signatureBase64Url = signDomainConnectRequest(
			queryString,
			privateKey,
		);

		// Verify it is base64url encoded (contains no +, / or = padding, only URL-safe chars)
		expect(signatureBase64Url).not.toContain("+");
		expect(signatureBase64Url).not.toContain("/");
		expect(signatureBase64Url).not.toContain("=");

		// 3. Verify signature using node:crypto verify
		const verify = createVerify("SHA256");
		verify.update(queryString);
		verify.end();

		const isValid = verify.verify(publicKey, signatureBase64Url, "base64url");

		expect(isValid).toBe(true);
	});
});
