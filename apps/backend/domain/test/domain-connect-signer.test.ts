import { describe, expect, it } from "bun:test";
import { createVerify, generateKeyPairSync } from "node:crypto";
import { signDomainConnectRequest } from "@reloop/domain/utils/domain-connect-signer";

describe("Domain Connect Request Signer", () => {
	it("should sign query strings using RSA-SHA256 and output base64 signatures", () => {
		// 1. Generate ephemeral RSA key pair for testing
		const { privateKey, publicKey } = generateKeyPairSync("rsa", {
			modulusLength: 2048,
			publicKeyEncoding: { type: "spki", format: "pem" },
			privateKeyEncoding: { type: "pkcs8", format: "pem" },
		});

		const queryString =
			"domain=example.com&host=send&domainKey=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA";

		// 2. Sign query string
		const signatureBase64 = signDomainConnectRequest(queryString, privateKey);

		// Domain Connect uses standard base64 (URL-encoded when placed in the apply URL)
		expect(signatureBase64).toMatch(/^[A-Za-z0-9+/=]+$/);

		// 3. Verify signature using node:crypto verify
		const verify = createVerify("SHA256");
		verify.update(queryString);
		verify.end();

		const isValid = verify.verify(publicKey, signatureBase64, "base64");

		expect(isValid).toBe(true);
	});
});
