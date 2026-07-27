import type { CodeSample } from "../types";

import { createApiKeyXCodeSamples } from "./create-api-key/create-api-key";
import { deleteApiKeyXCodeSamples } from "./delete-api-key/delete-api-key";
import { disableApiKeyXCodeSamples } from "./disable-api-key/disable-api-key";
import { enableApiKeyXCodeSamples } from "./enable-api-key/enable-api-key";
import { getApiKeyXCodeSamples } from "./get-api-key/get-api-key";
import { listApiKeysXCodeSamples } from "./list-api-keys/list-api-keys";
import { rotateApiKeyXCodeSamples } from "./rotate-api-key/rotate-api-key";
import { updateApiKeyXCodeSamples } from "./update-api-key/update-api-key";

export { createApiKeyXCodeSamples };
export { deleteApiKeyXCodeSamples };
export { disableApiKeyXCodeSamples };
export { enableApiKeyXCodeSamples };
export { getApiKeyXCodeSamples };
export { listApiKeysXCodeSamples };
export { rotateApiKeyXCodeSamples };
export { updateApiKeyXCodeSamples };

export const apiKeySamples = {
	createApiKey: createApiKeyXCodeSamples,
	deleteApiKey: deleteApiKeyXCodeSamples,
	disableApiKey: disableApiKeyXCodeSamples,
	enableApiKey: enableApiKeyXCodeSamples,
	getApiKey: getApiKeyXCodeSamples,
	listApiKeys: listApiKeysXCodeSamples,
	rotateApiKey: rotateApiKeyXCodeSamples,
	updateApiKey: updateApiKeyXCodeSamples,
} as const satisfies Record<string, readonly CodeSample[]>;

export type ApiKeySampleKey = keyof typeof apiKeySamples;
