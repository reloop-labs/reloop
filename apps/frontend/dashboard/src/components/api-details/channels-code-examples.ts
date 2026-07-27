import {
	createChannelXCodeSamples,
	deleteChannelXCodeSamples,
	getChannelXCodeSamples,
	listChannelsXCodeSamples,
	updateChannelXCodeSamples,
} from "@reloop/code-samples/contacts";
import { toDashboardCodeExamples } from "@reloop/code-samples/helpers";

const LANG_IDS = [
	"node",
	"ruby",
	"php",
	"python",
	"go",
	"rust",
	"java",
	"dotnet",
	"curl",
] as const;

export const codeExamples = toDashboardCodeExamples(
	[
		{ id: "add", samples: createChannelXCodeSamples },
		{ id: "get", samples: getChannelXCodeSamples },
		{ id: "list", samples: listChannelsXCodeSamples },
		{ id: "update", samples: updateChannelXCodeSamples },
		{ id: "delete", samples: deleteChannelXCodeSamples },
	],
	LANG_IDS,
);
