import type { CodeSample } from "../types";

import { createDomainXCodeSamples } from "./create-domain/create-domain";
import { deleteDomainXCodeSamples } from "./delete-domain/delete-domain";
import { getDomainXCodeSamples } from "./get-domain/get-domain";
import { getDomainNameserversXCodeSamples } from "./get-domain-nameserver/get-domain-nameserver";
import { listDomainsXCodeSamples } from "./list-domains/list-domains";
import { updateDomainXCodeSamples } from "./update-domain/update-domain";
import { verifyDNSXCodeSamples } from "./verify-dns/verify-dns";

export { createDomainXCodeSamples };
export { deleteDomainXCodeSamples };
export { getDomainNameserversXCodeSamples };
export { getDomainXCodeSamples };
export { listDomainsXCodeSamples };
export { updateDomainXCodeSamples };
export { verifyDNSXCodeSamples };

export const domainSamples = {
	createDomain: createDomainXCodeSamples,
	deleteDomain: deleteDomainXCodeSamples,
	getDomainNameserver: getDomainNameserversXCodeSamples,
	getDomain: getDomainXCodeSamples,
	listDomains: listDomainsXCodeSamples,
	updateDomain: updateDomainXCodeSamples,
	verifyDns: verifyDNSXCodeSamples,
} as const satisfies Record<string, readonly CodeSample[]>;

export type DomainSampleKey = keyof typeof domainSamples;
