import type { GlossaryTermDefinition } from "../types";

export const term: GlossaryTermDefinition = {
	slug: "dkim",
	title: "DKIM",
	description:
		"A digital signature on the message that proves the content was not altered in transit.",
	keywords: ["DKIM","DKIM signature","DKIM DNS"],
	body: `DKIM (DomainKeys Identified Mail) adds a digital signature to message headers. The sender signs selected headers and the body with a private key. Receivers fetch the matching public key from DNS (a TXT record under a selector) and check the signature.

If verification passes, the message was authorized by someone who controls that domain's key and was not changed in ways that break the signed hash. If it fails, something altered signed content, or the wrong key is published.

You can rotate selectors and keys over time. Multiple selectors let you run more than one sending system without sharing private keys.

Reloop generates DKIM keys when you verify a domain and shows the DNS record to publish. Keep the private key on the sender; only the public half belongs in DNS.`,
	relatedTerms: [
		{
			slug: "spf",
			title: "SPF",
		},
		{
			slug: "dmarc",
			title: "DMARC",
		},
		{
			slug: "authentication",
			title: "Authentication",
		},
	],
	relatedFeatureHref: "/tools/auth-checker",
};
