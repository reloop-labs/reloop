import { createSign } from "node:crypto";

/**
 * Sign a Domain Connect apply query string using RSA-SHA256.
 *
 * The corresponding public key must be published as a TXT record at:
 *   {keyId}.{syncPubKeyDomain}  (e.g., _dc.reloop.sh)
 *
 * Spec: signature is standard Base64 (not base64url); the apply URL builder
 * URL-encodes it when appending `sig=`. Sign over the URL-encoded query string
 * excluding `sig` and `key`.
 *
 * @param queryString  The query string to sign (WITHOUT leading ?)
 * @param privateKeyPem  RSA private key in PEM format
 * @returns Base64-encoded signature
 */
export function signDomainConnectRequest(
	queryString: string,
	privateKeyPem: string,
): string {
	const sign = createSign("SHA256");
	sign.update(queryString);
	sign.end();
	return sign.sign(privateKeyPem, "base64");
}
