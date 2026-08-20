import { toDashboardCodeExamples } from "@reloop/code-samples/helpers";
import {
	getMessageXCodeSamples,
	listMessagesXCodeSamples,
	listSentMessagesXCodeSamples,
} from "@reloop/code-samples/inbox";
import { sendEmailXCodeSamples } from "@reloop/code-samples/mail";

/** Package sample id order matching email drawer language tabs. */
const LANG_IDS = [
	"node",
	"python",
	"php",
	"go",
	"ruby",
	"rust",
	"java",
	"dotnet",
	"curl",
] as const;

export const codeExamples = toDashboardCodeExamples(
	[
		{ id: "send", samples: sendEmailXCodeSamples },
		{ id: "listSent", samples: listSentMessagesXCodeSamples },
		{ id: "listInbound", samples: listMessagesXCodeSamples },
		{ id: "getInbound", samples: getMessageXCodeSamples },
	],
	LANG_IDS,
	{ node: "javascript" },
);
