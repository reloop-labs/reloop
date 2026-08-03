"use client";

import {
	createApiKeyXCodeSamples,
	deleteApiKeyXCodeSamples,
	disableApiKeyXCodeSamples,
	enableApiKeyXCodeSamples,
	getApiKeyXCodeSamples,
	listApiKeysXCodeSamples,
	rotateApiKeyXCodeSamples,
	updateApiKeyXCodeSamples,
} from "@reloop/code-samples/api-key";
import type { LearnCodeSample } from "../components/mdx/CodeSamples";
import { CodeSamples } from "../components/mdx/CodeSamples";

const registry = {
	"apiKey.create": createApiKeyXCodeSamples,
	"apiKey.list": listApiKeysXCodeSamples,
	"apiKey.get": getApiKeyXCodeSamples,
	"apiKey.update": updateApiKeyXCodeSamples,
	"apiKey.rotate": rotateApiKeyXCodeSamples,
	"apiKey.disable": disableApiKeyXCodeSamples,
	"apiKey.enable": enableApiKeyXCodeSamples,
	"apiKey.delete": deleteApiKeyXCodeSamples,
} as const satisfies Record<string, readonly LearnCodeSample[]>;

export type ApiKeyCodeSampleId = keyof typeof registry;

export function ApiKeyCodeSamples({ id }: { id: ApiKeyCodeSampleId }) {
	const samples = registry[id];
	return <CodeSamples samples={samples as unknown as LearnCodeSample[]} />;
}
