import { useRouter } from "next/navigation";
import * as Button from "@reloop/ui/button";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";

import { useState } from "react";
import {
	siCurl,
	siGo,
	siNodedotjs,
	siPhp,
	siPython,
	siRuby,
	siRust,
} from "simple-icons";
import { CopyCodeBlock } from "#/features/onboarding/step4/copy-code-block";

interface ApiSyncStepProps {
	onBack: () => void;
}

type ApiLanguageId =
	| "curl"
	| "node"
	| "python"
	| "go"
	| "php"
	| "ruby"
	| "rust";

interface ApiLanguage {
	id: ApiLanguageId;
	label: string;
	shikiLang: string;
	filename: string;
	si: { path: string; hex: string };
}

const API_LANGUAGES: ApiLanguage[] = [
	{
		id: "curl",
		label: "cURL",
		shikiLang: "bash",
		filename: "curl.sh",
		si: siCurl,
	},
	{
		id: "node",
		label: "Node.js SDK",
		shikiLang: "javascript",
		filename: "index.js",
		si: siNodedotjs,
	},
	{
		id: "python",
		label: "Python",
		shikiLang: "python",
		filename: "app.py",
		si: siPython,
	},
	{
		id: "go",
		label: "Go",
		shikiLang: "go",
		filename: "main.go",
		si: siGo,
	},
	{
		id: "php",
		label: "PHP",
		shikiLang: "php",
		filename: "index.php",
		si: siPhp,
	},
	{
		id: "ruby",
		label: "Ruby",
		shikiLang: "ruby",
		filename: "app.rb",
		si: siRuby,
	},
	{
		id: "rust",
		label: "Rust",
		shikiLang: "rust",
		filename: "main.rs",
		si: siRust,
	},
];

const CODE_EXAMPLES: Record<ApiLanguageId, string> = {
	curl: `curl -X POST https://api.reloop.sh/v1/contacts \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "user@example.com",
    "first_name": "Jane",
    "last_name": "Doe",
    "properties": {
      "plan": "pro"
    }
  }'`,

	node: `import { Reloop } from '@reloop/sdk';

const reloop = new Reloop({ apiKey: process.env.RELOOP_API_KEY });

await reloop.contacts.create({
  email: 'user@example.com',
  firstName: 'Jane',
  lastName: 'Doe',
  properties: {
    plan: 'pro',
  },
});`,

	python: `from reloop import Reloop
import os

reloop = Reloop(api_key=os.environ.get("RELOOP_API_KEY"))

contact = reloop.contacts.create(
    email="user@example.com",
    first_name="Jane",
    last_name="Doe",
    properties={
        "plan": "pro"
    }
)`,

	go: `package main

import (
	"context"
	"os"
	"github.com/reloop/reloop-go"
)

func main() {
	client := reloop.NewClient(os.Getenv("RELOOP_API_KEY"))

	contact, err := client.Contacts.Create(context.Background(), &reloop.CreateContactParams{
		Email:     "user@example.com",
		FirstName: "Jane",
		LastName:  "Doe",
		Properties: map[string]interface{}{
			"plan": "pro",
		},
	})
}`,

	php: `<?php

use Reloop\\Client;

$reloop = new Client(getenv('RELOOP_API_KEY'));

$contact = $reloop->contacts->create([
    'email' => 'user@example.com',
    'first_name' => 'Jane',
    'last_name' => 'Doe',
    'properties' => [
        'plan' => 'pro'
    ]
]);`,

	ruby: `require 'reloop'

reloop = Reloop::Client.new(api_key: ENV['RELOOP_API_KEY'])

contact = reloop.contacts.create(
  email: 'user@example.com',
  first_name: 'Jane',
  last_name: 'Doe',
  properties: {
    plan: 'pro'
  }
)`,

	rust: `use reloop::Client;
use serde_json::json;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std.error::Error>> {
    let client = Client::new(std::env::var("RELOOP_API_KEY")?);

    let contact = client
        .contacts()
        .create(json!({
            "email": "user@example.com",
            "first_name": "Jane",
            "last_name": "Doe",
            "properties": {
                "plan": "pro"
            }
        }))
        .await?;

    Ok(())
}`,
};

export function ApiSyncStep({ onBack }: ApiSyncStepProps) {
	const router = useRouter();
	const [selectedTab, setSelectedTab] = useState<ApiLanguageId>("curl");

	const activeLang =
		API_LANGUAGES.find((l) => l.id === selectedTab) ?? API_LANGUAGES[0]!;

	const tabs = API_LANGUAGES.map((l) => ({
		id: l.id,
		label: l.label,
		si: l.si,
	}));

	return (
		<div className="w-full space-y-6 font-sans">
			{/* Main Card Container */}
			<div className="overflow-hidden rounded-[18px] border border-stroke-soft-200 bg-bg-soft-50">
				{/* Top Padded Content Area */}
				<div className="m-0.5 max-h-[calc(100dvh-320px)] overflow-y-auto space-y-6 rounded-2xl border border-stroke-soft-200 bg-bg-white-0 px-6 pt-4 pb-6">
					{/* Header */}
					<div>
						<h2 className="font-semibold text-base text-text-strong-950 tracking-tight">
							Sync Contacts via SDK
						</h2>
						<p className="mt-1 text-text-sub-600 text-xs leading-relaxed">
							Stream new signups and user updates directly from your backend
							application.
						</p>
					</div>

					<div className="space-y-4">
						<CopyCodeBlock
							key={selectedTab}
							code={CODE_EXAMPLES[selectedTab]}
							lang={activeLang.shikiLang}
							label={activeLang.filename}
							si={activeLang.si}
							tabs={tabs}
							activeTab={selectedTab}
							onTabChange={(id) => setSelectedTab(id as ApiLanguageId)}
							codeExtraPadding
						/>

						<div className="space-y-1 rounded-xl border border-stroke-soft-200 bg-bg-weak-50/30 p-3.5 text-text-sub-600 text-xs">
							<p className="font-medium text-text-strong-950">
								API Keys Required
							</p>
							<p className="leading-relaxed">
								Be sure to pass a valid secret API key in the authorization
								header. You can generate or view your workspace API keys in API
								Keys settings.
							</p>
						</div>
					</div>
				</div>

				{/* Bottom Footer / Action Bar */}
				<div className="flex items-center justify-between px-6 pt-3 pb-3.5 dark:bg-bg-weak-50/40">
					<Button.Root
						type="button"
						variant="neutral"
						mode="ghost"
						size="small"
						onClick={onBack}
					>
						Back
					</Button.Root>

					<div className="flex items-center gap-3">
						<a
							href="https://reloop.sh/docs/api-reference/contacts"
							target="_blank"
							rel="noreferrer"
							className="inline-flex items-center gap-1 font-medium text-text-strong-950 text-xs hover:underline"
						>
							API Documentation
							<Icon name="chevron-right" className="h-3 w-3" />
						</a>

						<FancyButton.Root
							type="button"
							variant="primary"
							size="small"
							onClick={() => router.push("/contacts")}
						>
							Done
						</FancyButton.Root>
					</div>
				</div>
			</div>
		</div>
	);
}
