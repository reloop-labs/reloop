/**
 * Unified `reloop-email` branding for SDK code samples across languages.
 */

export const RELOOP_EMAIL = {
	node: {
		import: "import Reloop from 'reloop-email';",
		install: "npm install reloop-email",
	},
	python: {
		import: "from reloop_email import Reloop",
		install: "pip install reloop-email",
	},
	php: {
		install: "composer require reloop/reloop-email",
	},
	go: {
		import: 'import reloopemail "github.com/reloop-labs/reloop-email"',
		install: "go get github.com/reloop-labs/reloop-email",
		client: (apiKey: string) =>
			[
				"reloop, _ := reloopemail.NewClient(reloopemail.ClientOptions{",
				`    APIKey: "${apiKey}",`,
				"})",
			].join("\n"),
	},
	java: {
		imports: ["import sh.reloop.email.ReloopEmail;", "import java.util.*;"],
		install: "sh.reloop:reloop-email",
		client: (apiKey: string) =>
			`ReloopEmail reloop = ReloopEmail.client("${apiKey}");`,
	},
	rust: {
		imports: ["use reloop_email::ReloopEmail;", "use serde_json::json;"],
		install: "cargo add reloop-email",
		client: (apiKey: string) =>
			`let reloop = ReloopEmail::new("${apiKey}".to_string(), None);`,
	},
	dotnet: {
		imports: ["using Reloop.Email;", "using System.Collections.Generic;"],
		install: "dotnet add package Reloop.Email",
		client: (apiKey: string) => `var reloop = ReloopEmail.Client("${apiKey}");`,
	},
	ruby: {
		install: "gem install reloop-email",
	},
} as const;
