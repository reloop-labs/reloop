#!/usr/bin/env bun
/**
 * Standardizes SDK code samples to the unified `reloop-email` package branding.
 */

import fs from "node:fs";
import path from "node:path";
import { findSampleFiles, SERVICE_DIRS } from "./lib/python-sample-utils";

const TARGETS = process.argv.slice(2);

const EXTRA_DIRS = [
	path.resolve(__dirname, "../../../backend/template/src/routes"),
];

function standardize(content: string): string {
	let next = content;

	// Node.js — SDK 2.0: named import + { apiKey } (no key/url aliases, no string ctor)
	next = next.replace(/@reloop\/node/g, "reloop-email");
	next = next.replace(
		/import Reloop from ['"]reloop-email['"];/g,
		'import { Reloop } from "reloop-email";',
	);
	next = next.replace(
		/import \{ Reloop \} from ['"]reloop-email['"];\n\nconst reloop = new Reloop\(\{\s*key:\s*(['"])(.*?)\1\s*(?:,\s*url:\s*(['"])(.*?)\3\s*)?\}\)/g,
		'import { Reloop } from "reloop-email";\n\nconst reloop = new Reloop({ apiKey: $1$2$1 });',
	);
	next = next.replace(
		/import \{ Reloop \} from ['"]reloop-email['"];\n\nconst reloop = new Reloop\(\{\s*url:\s*(['"])(.*?)\1\s*,\s*key:\s*(['"])(.*?)\3\s*\}\)/g,
		'import { Reloop } from "reloop-email";\n\nconst reloop = new Reloop({ apiKey: $3$4$3 });',
	);
	next = next.replace(
		/const reloop = new Reloop\(\{\s*key:\s*(['"])(.*?)\1\s*(?:,\s*url:\s*(['"])(.*?)\3\s*)?\}\)/g,
		"const reloop = new Reloop({ apiKey: $1$2$1 })",
	);
	next = next.replace(
		/const reloop = new Reloop\((['"])(.*?)\1\);/g,
		"const reloop = new Reloop({ apiKey: $1$2$1 });",
	);
	next = next.replace(
		/const reloop = new Reloop\((['"])(.*?)\1\)/g,
		"const reloop = new Reloop({ apiKey: $1$2$1 })",
	);

	// Python
	next = next.replace(
		/from reloop import Reloop/g,
		"from reloop_email import Reloop",
	);
	next = next.replace(
		/from reloop import ReloopClient/g,
		"from reloop_email import Reloop",
	);
	next = next.replace(
		/source: `reloop = Reloop\(api_key=/g,
		"source: `from reloop_email import Reloop\n\nreloop = Reloop(api_key=",
	);

	// Go
	next = next.replace(
		/github\.com\/reloop\/reloop-go/g,
		"github.com/reloop-labs/reloop-email",
	);
	next = next.replace(
		/github\.com\/reloop-labs\/reloop-go/g,
		"github.com/reloop-labs/reloop-email",
	);
	next = next.replace(
		/import reloop\n\nfunc main\(\) \{/g,
		'import reloopemail "github.com/reloop-labs/reloop-email"\n\nfunc main() {',
	);
	next = next.replace(
		/client, _ := reloop\.NewClient\(reloop\.ClientOptions\{/g,
		"reloop, _ := reloopemail.NewClient(reloopemail.ClientOptions{",
	);
	next = next.replace(/_, _ = client\./g, "_, _ = reloop.");
	next = next.replace(/_, _ = reloop\.ApiKeys\./g, "_, _ = reloop.ApiKeys().");
	next = next.replace(
		/_, _ = reloop\.Contacts\./g,
		"_, _ = reloop.Contacts().",
	);
	next = next.replace(
		/reloop\.Contacts\(\)\.Groups\(\)\./g,
		"reloop.Contacts().Groups().",
	);
	next = next.replace(
		/reloop\.Contacts\(\)\.Channels\(\)\./g,
		"reloop.Contacts().Channels().",
	);

	// Java
	next = next.replace(
		/import sh\.reloop\.ReloopClient;\nimport sh\.reloop\.models\.Models\.\*;\n\nReloopClient reloop = new ReloopClient\(/g,
		"import sh.reloop.email.ReloopEmail;\nimport sh.reloop.email.Models.*;\n\nReloopEmail reloop = ReloopEmail.client(",
	);
	next = next.replace(
		/import sh\.reloop\.ReloopClient;\nimport java\.util\.\*;\n\nReloopClient reloop = new ReloopClient\(/g,
		"import sh.reloop.email.ReloopEmail;\nimport java.util.*;\n\nReloopEmail reloop = ReloopEmail.client(",
	);
	next = next.replace(
		/import sh\.reloop\.ReloopClient;\n\nReloopClient reloop = new ReloopClient\(/g,
		"import sh.reloop.email.ReloopEmail;\n\nReloopEmail reloop = ReloopEmail.client(",
	);
	next = next.replace(
		/ReloopClient reloop = new ReloopClient\("([^"]+)"\);/g,
		'ReloopEmail reloop = ReloopEmail.client("$1");',
	);
	next = next.replace(/reloop\.apiKeys\./g, "reloop.apiKeys().");
	next = next.replace(/reloop\.contacts\./g, "reloop.contacts().");
	next = next.replace(
		/reloop\.contacts\(\)\.groups\./g,
		"reloop.contacts().groups().",
	);
	next = next.replace(
		/reloop\.contacts\(\)\.channels\./g,
		"reloop.contacts().channels().",
	);

	// Rust
	next = next.replace(
		/use reloop::ReloopClient;\nuse serde_json::json;/g,
		"use reloop_email::ReloopEmail;\nuse serde_json::json;",
	);
	next = next.replace(
		/use reloop::\{CreateApiKeyParams, UpdateApiKeyParams, ApiKeyListParams\};/g,
		"use reloop_email::{CreateApiKeyParams, UpdateApiKeyParams, ApiKeyListParams};",
	);
	next = next.replace(
		/let reloop = ReloopClient::new\(/g,
		"let reloop = ReloopEmail::new(",
	);
	next = next.replace(/reloop\.api_keys\(\)/g, "reloop.api_keys()");
	next = next.replace(/reloop\.contacts\(\)/g, "reloop.contacts()");

	// .NET
	next = next.replace(
		/using Reloop;\nusing Reloop\.Models;/g,
		"using Reloop.Email;\nusing Reloop.Email.Models;",
	);
	next = next.replace(
		/using Reloop;\nusing System\.Collections\.Generic;/g,
		"using Reloop.Email;\nusing System.Collections.Generic;",
	);
	next = next.replace(
		/using Reloop;\n\nvar reloop = new ReloopClient\(/g,
		"using Reloop.Email;\n\nvar reloop = ReloopEmail.Client(",
	);
	next = next.replace(
		/var reloop = new ReloopClient\("([^"]+)"\);/g,
		'var reloop = ReloopEmail.Client("$1");',
	);
	next = next.replace(/await reloop\.ApiKeys\./g, "await reloop.ApiKeys().");
	next = next.replace(/await reloop\.Contacts\./g, "await reloop.Contacts().");
	next = next.replace(
		/await reloop\.Contacts\.Groups\./g,
		"await reloop.Contacts().Groups().",
	);
	next = next.replace(
		/await reloop\.Contacts\.Channels\./g,
		"await reloop.Contacts().Channels().",
	);

	return next;
}

let updated = 0;

for (const service of SERVICE_DIRS) {
	if (TARGETS.length > 0 && !TARGETS.includes(service.name)) {
		continue;
	}

	for (const filePath of findSampleFiles(service.dir)) {
		processFile(filePath);
	}
}

for (const dir of EXTRA_DIRS) {
	if (!fs.existsSync(dir)) {
		continue;
	}
	for (const filePath of findSampleFiles(dir)) {
		processFile(filePath);
	}
}

function processFile(filePath: string) {
	const content = fs.readFileSync(filePath, "utf8");
	const nextContent = standardize(content);
	if (nextContent !== content) {
		fs.writeFileSync(filePath, nextContent);
		updated++;
		console.log(`Updated ${path.relative(process.cwd(), filePath)}`);
	}
}

console.log(`\nDone. Updated ${updated} sample file(s).`);
