import { createSign } from "node:crypto";

/**
 * Sign a Domain Connect apply query string using RSA-SHA256.
 *
 * The corresponding public key must be published as a TXT record at:
 *   {keyId}.{syncPubKeyDomain}  (e.g., _dc.reloop.sh)
 *
 * @param queryString  The query string to sign (WITHOUT leading ?)
 * @param privateKeyPem  RSA private key in PEM format
 * @returns Base64url-encoded signature
 */
export function signDomainConnectRequest(
	queryString: string,
	privateKeyPem: string,
): string {
	const sign = createSign("SHA256");
	sign.update(queryString);
	sign.end();
	return sign.sign(privateKeyPem, "base64url");
}
