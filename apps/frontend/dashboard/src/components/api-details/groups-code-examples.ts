import {
	createGroupXCodeSamples,
	deleteGroupXCodeSamples,
	getGroupXCodeSamples,
	listGroupContactsXCodeSamples,
	listGroupsXCodeSamples,
	updateGroupXCodeSamples,
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
		{ id: "add", samples: createGroupXCodeSamples },
		{ id: "get", samples: getGroupXCodeSamples },
		{ id: "list", samples: listGroupsXCodeSamples },
		{ id: "update", samples: updateGroupXCodeSamples },
		{ id: "delete", samples: deleteGroupXCodeSamples },
		{ id: "getContacts", samples: listGroupContactsXCodeSamples },
	],
	LANG_IDS,
);
