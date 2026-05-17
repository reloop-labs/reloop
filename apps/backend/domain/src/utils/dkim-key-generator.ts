import { generateKeyPair } from "node:crypto";
import { promisify } from "node:util";
import { domainConfig } from "@reloop/domain/domain.config";
import type { DNSTypes } from "@reloop/domain/types/dns.type";

const generateKeyPairAsync = promisify(generateKeyPair);

export async function generateDKIMKeyPair(): Promise<DNSTypes.DKIMKeyPair> {
	try {
		const { publicKey, privateKey } = await generateKeyPairAsync("rsa", {
			modulusLength: domainConfig.constants.keyLength,
			publicKeyEncoding: {
				type: "spki",
				format: "pem",
			},
			privateKeyEncoding: {
				type: "pkcs8",
				format: "pem",
			},
		});

		return {
			publicKey,
			privateKey,
		};
	} catch (error) {
		throw new Error(`Failed to generate DKIM key pair: ${error}`);
	}
}
