import { getDomain } from "tldts";

/** Registrable root of a hostname: mail.acme.co.uk → acme.co.uk. */
export function rootDomainOf(hostname: string): string {
	const host = hostname.trim().toLowerCase().replace(/\.$/, "");
	return getDomain(host, { allowPrivateDomains: false }) ?? host;
}
