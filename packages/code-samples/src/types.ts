/** Single language sample for an API operation (OpenAPI x-codeSamples shape). */
export type CodeSample = {
	id: string;
	lang: string;
	label: string;
	source: string;
};

export type CodeSampleId =
	| "node"
	| "curl"
	| "python"
	| "php"
	| "java"
	| "dotnet"
	| "go"
	| "rust"
	| "ruby"
	| string;
