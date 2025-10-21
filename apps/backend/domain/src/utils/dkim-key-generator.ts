import { generateKeyPair } from "node:crypto";
import { promisify } from "node:util";
import type { DNSTypes } from "../routes/dns/dns.type";

const generateKeyPairAsync = promisify(generateKeyPair);

export async function generateDKIMKeyPair(
    selector = "mail",
    keyLength = 2048,
): Promise<DNSTypes.DKIMKeyPair> {
    try {
        const { publicKey, privateKey } = await generateKeyPairAsync("rsa", {
            modulusLength: keyLength,
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
            selector,
        };
    } catch (error) {
        throw new Error(`Failed to generate DKIM key pair: ${error}`);
    }
}
