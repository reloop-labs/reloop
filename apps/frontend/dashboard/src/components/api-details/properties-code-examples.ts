import {
	createPropertyXCodeSamples,
	deletePropertyXCodeSamples,
	listPropertiesXCodeSamples,
	updatePropertyXCodeSamples,
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
		{ id: "add", samples: createPropertyXCodeSamples },
		{ id: "list", samples: listPropertiesXCodeSamples },
		{ id: "update", samples: updatePropertyXCodeSamples },
		{ id: "delete", samples: deletePropertyXCodeSamples },
	],
	LANG_IDS,
);
