/**
 * One-shot generator: builds learn/ai/api-keys*.md from @reloop/code-samples.
 * Run: bun apps/frontend/docs/scripts/generate-api-keys-agent-md.ts
 */
import { existsSync, mkdirSync, unlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";
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
import {
	CODE_SAMPLE_LANGUAGE_ORDER,
	LANGUAGE_META,
} from "@reloop/code-samples/languages";
import type { CodeSample } from "@reloop/code-samples/types";

const outDir = join(import.meta.dirname, "../content/docs/learn/ai");

mkdirSync(outDir, { recursive: true });

const operations: {
	id: string;
	title: string;
	method: string;
	path: string;
	samples: CodeSample[];
}[] = [
	{
		id: "create",
		title: "Create API key",
		method: "POST",
		path: "/api/api-key/v1/",
		samples: createApiKeyXCodeSamples,
	},
	{
		id: "list",
		title: "List API keys",
		method: "GET",
		path: "/api/api-key/v1/",
		samples: listApiKeysXCodeSamples,
	},
	{
		id: "get",
		title: "Get API key",
		method: "GET",
		path: "/api/api-key/v1/:api_key_id",
		samples: getApiKeyXCodeSamples,
	},
	{
		id: "update",
		title: "Update API key",
		method: "PATCH",
		path: "/api/api-key/v1/:api_key_id",
		samples: updateApiKeyXCodeSamples,
	},
	{
		id: "rotate",
		title: "Rotate API key",
		method: "POST",
		path: "/api/api-key/v1/rotate/:api_key_id",
		samples: rotateApiKeyXCodeSamples,
	},
	{
		id: "disable",
		title: "Disable API key",
		method: "POST",
		path: "/api/api-key/v1/disable/:api_key_id",
		samples: disableApiKeyXCodeSamples,
	},
	{
		id: "enable",
		title: "Enable API key",
		method: "POST",
		path: "/api/api-key/v1/enable/:api_key_id",
		samples: enableApiKeyXCodeSamples,
	},
	{
		id: "delete",
		title: "Delete API key",
		method: "DELETE",
		path: "/api/api-key/v1/:api_key_id",
		samples: deleteApiKeyXCodeSamples,
	},
];

const fenceFor = (langId: string) => LANGUAGE_META[langId]?.shikiLang ?? langId;
const labelFor = (langId: string) => LANGUAGE_META[langId]?.label ?? langId;

const index = `# API Keys (agent guide)

> Prefer this guide over the human dashboard page at \`/docs/learn/api-keys\`. Use a language-specific file below for runnable SDK samples.

## Auth

- Send \`x-api-key: <secret>\` on every request.
- Secrets are prefixed with \`rl_\`.
- Store secrets in env vars / a secret manager. Never commit them.
- The full secret is returned **once** on create and rotate. Reloop stores a hash; it cannot be retrieved again.

## Rules

- **Disable** pauses the key (requests return 401); you can re-enable later.
- **Delete** permanently revokes the key; irreversible.
- API keys work for REST (\`x-api-key\`) and SMTP (password = secret).
- Creating or managing keys requires an existing authenticated API key.

## Endpoints

| Action | Method | Path |
|--------|--------|------|
| Create | POST | /api/api-key/v1/ |
| List | GET | /api/api-key/v1/ |
| Get | GET | /api/api-key/v1/:api_key_id |
| Update | PATCH | /api/api-key/v1/:api_key_id |
| Rotate | POST | /api/api-key/v1/rotate/:api_key_id |
| Disable | POST | /api/api-key/v1/disable/:api_key_id |
| Enable | POST | /api/api-key/v1/enable/:api_key_id |
| Delete | DELETE | /api/api-key/v1/:api_key_id |

Base URL: \`https://reloop.sh\`

## Language guides

${CODE_SAMPLE_LANGUAGE_ORDER.map(
	(id) => `- [${labelFor(id)}](./api-keys.${id}.md)`,
).join("\n")}

## Dashboard (humans)

Dashboard UI walkthrough (GIFs, tabs): [/docs/learn/api-keys](https://reloop.sh/docs/learn/api-keys)
`;

writeFileSync(join(outDir, "api-keys.md"), index);
console.log("wrote api-keys.md");

for (const langId of CODE_SAMPLE_LANGUAGE_ORDER) {
	const fence = fenceFor(langId);
	const label = labelFor(langId);
	const sections: string[] = [
		`# API Keys — ${label}`,
		"",
		`> Agent-optimized samples for managing Reloop API keys in ${label}. Index: [api-keys.md](./api-keys.md)`,
		"",
		"## Auth reminder",
		"",
		"- Header: `x-api-key: rl_...`",
		"- Secret shown once on create/rotate",
		"",
	];

	for (const op of operations) {
		const sample = op.samples.find((s) => s.id === langId);
		if (!sample) {
			console.warn(`Missing sample ${op.id}/${langId}`);
			continue;
		}
		sections.push(`## ${op.title}`);
		sections.push("");
		sections.push(`\`${op.method} ${op.path}\``);
		sections.push("");
		sections.push("```" + fence);
		sections.push(sample.source.trimEnd());
		sections.push("```");
		sections.push("");
	}

	writeFileSync(join(outDir, `api-keys.${langId}.md`), sections.join("\n"));
	console.log(`wrote api-keys.${langId}.md`);
}

for (const stub of ["api-keys.ai.md", "api-key.ai.node.md"]) {
	const p = join(outDir, stub);
	if (existsSync(p)) {
		unlinkSync(p);
		console.log(`deleted ${stub}`);
	}
}

console.log("done");
