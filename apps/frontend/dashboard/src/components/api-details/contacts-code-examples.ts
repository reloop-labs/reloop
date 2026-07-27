import {
	addContactToChannelXCodeSamples,
	addContactToGroupXCodeSamples,
	createContactXCodeSamples,
	deleteContactXCodeSamples,
	getContactXCodeSamples,
	listContactsXCodeSamples,
	removeContactFromGroupXCodeSamples,
	updateContactChannelXCodeSamples,
	updateContactXCodeSamples,
} from "@reloop/code-samples/contacts";
import { toDashboardCodeExamples } from "@reloop/code-samples/helpers";

/** Package sample id order matching contacts drawer language tabs. */
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
		{ id: "add", samples: createContactXCodeSamples },
		{ id: "get", samples: getContactXCodeSamples },
		{ id: "list", samples: listContactsXCodeSamples },
		{ id: "update", samples: updateContactXCodeSamples },
		{ id: "delete", samples: deleteContactXCodeSamples },
		{ id: "addChannel", samples: addContactToChannelXCodeSamples },
		{ id: "updateChannel", samples: updateContactChannelXCodeSamples },
		{ id: "addGroup", samples: addContactToGroupXCodeSamples },
		{ id: "deleteGroup", samples: removeContactFromGroupXCodeSamples },
	],
	LANG_IDS,
);
