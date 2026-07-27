import type { CodeSample } from "../types";

import { createTemplateXCodeSamples } from "./create-template/create-template";
import { createVersionXCodeSamples } from "./create-version/create-version";
import { deleteTemplateXCodeSamples } from "./delete-template/delete-template";
import { deleteVersionXCodeSamples } from "./delete-version/delete-version";
import { duplicateTemplateXCodeSamples } from "./duplicate-template/duplicate-template";
import { getTemplateXCodeSamples } from "./get-template/get-template";
import { listTemplatesXCodeSamples } from "./list-templates/list-templates";
import { listVersionsXCodeSamples } from "./list-versions/list-versions";
import { restoreVersionXCodeSamples } from "./restore-version/restore-version";
import { updateTemplateXCodeSamples } from "./update-template/update-template";

export { createTemplateXCodeSamples };
export { createVersionXCodeSamples };
export { deleteTemplateXCodeSamples };
export { deleteVersionXCodeSamples };
export { duplicateTemplateXCodeSamples };
export { getTemplateXCodeSamples };
export { listTemplatesXCodeSamples };
export { listVersionsXCodeSamples };
export { restoreVersionXCodeSamples };
export { updateTemplateXCodeSamples };

export const templateSamples = {
	createTemplate: createTemplateXCodeSamples,
	createVersion: createVersionXCodeSamples,
	deleteTemplate: deleteTemplateXCodeSamples,
	deleteVersion: deleteVersionXCodeSamples,
	duplicateTemplate: duplicateTemplateXCodeSamples,
	getTemplate: getTemplateXCodeSamples,
	listTemplates: listTemplatesXCodeSamples,
	listVersions: listVersionsXCodeSamples,
	restoreVersion: restoreVersionXCodeSamples,
	updateTemplate: updateTemplateXCodeSamples,
} as const satisfies Record<string, readonly CodeSample[]>;

export type TemplateSampleKey = keyof typeof templateSamples;
