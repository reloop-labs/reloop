/**
 * Split a full domain into Domain Connect's required parts.
 *
 * "send.example.com"      → { domain: "example.com", host: "send" }
 * "mail.send.example.com" → { domain: "example.com", host: "mail.send" }
 * "example.com"           → { domain: "example.com", host: "" }
 */
export function getDomainConnectParts(fullDomain: string): {
	domain: string;
	host: string;
} {
	const parts = fullDomain.split(".");
	if (parts.length >= 3) {
		return {
			domain: parts.slice(-2).join("."),
			host: parts.slice(0, -2).join("."),
		};
	}
	return { domain: fullDomain, host: "" };
}
