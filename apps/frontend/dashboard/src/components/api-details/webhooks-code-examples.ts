import { toDashboardCodeExamples } from "@reloop/code-samples/helpers";
import {
	createWebhookXCodeSamples,
	deleteWebhookXCodeSamples,
	listWebhooksXCodeSamples,
} from "@reloop/code-samples/webhook";

/** Webhooks drawer uses language id `javascript` for Node samples. */
const LANG_IDS = ["node", "python", "php"] as const;

export const codeExamples = toDashboardCodeExamples(
	[
		{ id: "create", samples: createWebhookXCodeSamples },
		{ id: "list", samples: listWebhooksXCodeSamples },
		{ id: "delete", samples: deleteWebhookXCodeSamples },
	],
	LANG_IDS,
	{ node: "javascript" },
);
