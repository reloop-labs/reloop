import {
	createDomainXCodeSamples,
	deleteDomainXCodeSamples,
	getDomainXCodeSamples,
	listDomainsXCodeSamples,
	updateDomainXCodeSamples,
	verifyDNSXCodeSamples,
} from "@reloop/code-samples/domain";
import { toDashboardCodeExamples } from "@reloop/code-samples/helpers";

/** Domain drawer uses language id `javascript` for Node samples. */
const LANG_IDS = ["node", "python", "php"] as const;

export const codeExamples = toDashboardCodeExamples(
	[
		{ id: "create", samples: createDomainXCodeSamples },
		{ id: "list", samples: listDomainsXCodeSamples },
		{ id: "get", samples: getDomainXCodeSamples },
		{ id: "update", samples: updateDomainXCodeSamples },
		{ id: "delete", samples: deleteDomainXCodeSamples },
		{ id: "verify", samples: verifyDNSXCodeSamples },
	],
	LANG_IDS,
	{ node: "javascript" },
);
