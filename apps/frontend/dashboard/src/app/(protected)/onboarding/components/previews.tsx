"use client";

import { CodeBlock } from "@reloop/ui/code-block";
import { Icon } from "@reloop/ui/icon";
import { Mail, ShieldCheck } from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";
import { LanguageTabs } from "./language-tabs";

interface SidebarPreviewProps {
	name: string;
	logo: string | null;
	slug: string;
}

export const SidebarPreview = ({ name, logo, slug }: SidebarPreviewProps) => {
	return (
		<div className="absolute top-32 left-28">
			<div className="relative flex h-[520px] w-[480px] flex-col overflow-hidden rounded-2xl border border-stroke-soft-200 bg-bg-white-0 shadow-2xl">
				<div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-bg-white-0 to-transparent" />
				<div className="flex items-center gap-2 border-stroke-soft-100 border-b bg-bg-white-0 p-3">
					<div className="flex gap-1.5">
						<div className="h-3 w-3 rounded-full bg-error-base/80" />
						<div className="h-3 w-3 rounded-full bg-warning-base/80" />
						<div className="h-3 w-3 rounded-full bg-success-base/80" />
					</div>
					<div className="ml-4 flex-1 rounded-md bg-bg-weak-50 px-3 py-1 text-center font-mono text-text-soft-400 text-xs">
						reloop.sh/dashboard/{slug}
					</div>
				</div>
				<div className="flex flex-1 overflow-hidden">
					<div className="flex w-52 flex-col gap-2 border-stroke-soft-100 border-r">
						<div className="flex w-full items-center gap-2 border-stroke-soft-100 border-b px-4 py-2">
							{logo ? (
								<img src={logo} alt="Logo" className="h-6 w-6 object-cover" />
							) : (
								<span className="flex h-6 w-6 items-center justify-center rounded-lg border border-stroke-soft-200 p-1 font-bold text-xs">
									{name && name.length > 0 ? name[0]?.toUpperCase() : "W"}
								</span>
							)}
							<p className="text-text-soft-400">/</p>
							<div className="truncate font-semibold text-xs">
								{name || "Workspace"}
							</div>
							<Icon
								name="chevron-down"
								className="h-3 w-3 text-text-soft-400"
							/>
						</div>

						<div className="space-y-1 px-4">
							<div className="flex h-8 items-center gap-3 opacity-50">
								<div className="h-5 w-5 rounded-full bg-bg-soft-200" />
								<div className="h-[17px] w-40 rounded-full bg-bg-soft-200" />
							</div>

							<div className="flex h-8 items-center gap-3 opacity-50">
								<div className="h-5 w-5 rounded-full bg-bg-soft-200" />
								<div className="h-[17px] w-40 rounded-full bg-bg-soft-200" />
							</div>
							<div className="flex h-8 items-center gap-3 opacity-50">
								<div className="h-5 w-5 rounded-full bg-bg-soft-200" />
								<div className="h-[17px] w-40 rounded-full bg-bg-soft-200" />
							</div>
						</div>

						<div className="mt-auto border-stroke-soft-200 border-t pt-4">
							<div className="flex items-center gap-2 opacity-50">
								<div className="h-8 w-8 rounded-full bg-bg-soft-200" />
								<div className="flex-1 space-y-1">
									<div className="h-2 w-20 rounded bg-bg-soft-200" />
									<div className="h-2 w-12 rounded bg-bg-soft-200" />
								</div>
							</div>
						</div>
					</div>

					<div className="flex-1 bg-bg-white-0 p-6">
						<div className="mb-6 h-8 w-32 rounded bg-bg-weak-50" />
						<div className="grid grid-cols-2 gap-4">
							<div className="h-24 rounded-xl border border-stroke-soft-100 bg-bg-weak-50" />
							<div className="h-24 rounded-xl border border-stroke-soft-100 bg-bg-weak-50" />
						</div>
						<div className="mt-6 h-40 rounded-xl border border-stroke-soft-100 bg-bg-weak-50" />
					</div>
				</div>
			</div>
		</div>
	);
};

interface ApiPreviewProps {
	apiKey?: string;
}

type LanguageCode = "nodejs" | "go" | "php" | "python";

const codeExamples: Record<LanguageCode, { code: string; lang: string }> = {
	nodejs: {
		code: `import Reloop from 'reloop-email';

const reloop = new Reloop({
  url: 'https://api.reloop.sh',
  key: 'your-api-key'
});

// Send an email
const result = await reloop.mail.send({
  from: 'sender@example.com',
  to: 'recipient@example.com',
  subject: 'Hello',
  text: 'Hello World!'
});`,
		lang: "typescript",
	},
	go: {
		code: `package main

import (
  "fmt"
  "github.com/reloop/reloop-go"
)

func main() {
  client := reloop.NewClient(
    "https://api.reloop.sh",
    "your-api-key",
  )

  result, err := client.Mail.Send(&reloop.MailRequest{
    From:    "sender@example.com",
    To:      "recipient@example.com",
    Subject: "Hello",
    Text:    "Hello World!",
  })

  if err != nil {
    fmt.Println("Error:", err)
    return
  }

  fmt.Println("Success:", result)
}`,
		lang: "go",
	},
	php: {
		code: `<?php

require_once 'vendor/autoload.php';

use Reloop\\ReloopClient;

$client = new ReloopClient([
  'url' => 'https://api.reloop.sh',
  'key' => 'your-api-key'
]);

// Send an email
$result = $client->mail->send([
  'from' => 'sender@example.com',
  'to' => 'recipient@example.com',
  'subject' => 'Hello',
  'text' => 'Hello World!'
]);

echo json_encode($result, JSON_PRETTY_PRINT);`,
		lang: "php",
	},
	python: {
		code: `from reloop import Reloop

client = Reloop(
    url="https://api.reloop.sh",
    key="your-api-key"
)

# Send an email
result = client.mail.send(
    from_email="sender@example.com",
    to="recipient@example.com",
    subject="Hello",
    text="Hello World!"
)

print(result)`,
		lang: "python",
	},
};

export const ApiPreview = ({ apiKey: _apiKey }: ApiPreviewProps) => {
	const { resolvedTheme } = useTheme();
	const [selectedLang, setSelectedLang] = useState<LanguageCode>("nodejs");

	const currentCode = codeExamples[selectedLang];

	const handleLanguageChange = (value: string) => {
		if (value in codeExamples) {
			setSelectedLang(value as LanguageCode);
		}
	};

	return (
		<div>
			<div className="flex items-center gap-4 border-stroke-soft-100 border-b bg-bg-white-0 p-3">
				<div className="flex gap-1.5">
					<div className="h-3 w-3 rounded-full bg-error-base/80" />
					<div className="h-3 w-3 rounded-full bg-warning-base/80" />
					<div className="h-3 w-3 rounded-full bg-success-base/80" />
				</div>
			</div>
			<LanguageTabs
				defaultValue={selectedLang}
				onValueChange={handleLanguageChange}
			/>
			<CodeBlock
				code={currentCode.code}
				lang={currentCode.lang}
				theme={resolvedTheme === "light" ? "rose-pine-dawn" : "vesper"}
			/>
		</div>
	);
};

interface DomainPreviewProps {
	domain?: string;
}

export const DomainPreview = ({ domain }: DomainPreviewProps) => {
	return (
		<div className="w-full max-w-md">
			<div className="mb-4 rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-1 shadow-xl">
				<div className="flex items-center gap-3 rounded-lg border-stroke-soft-100 border-b bg-bg-weak-50 p-3">
					<div className="flex h-8 w-8 items-center justify-center rounded-full bg-information-lighter text-information-base">
						<Mail size={16} />
					</div>
					<div className="min-w-0 flex-1">
						<div className="mb-1.5 h-2 w-24 rounded bg-bg-soft-200" />
						<div className="h-2 w-16 rounded bg-bg-soft-200" />
					</div>
					<div className="text-text-soft-400 text-xs">Just now</div>
				</div>
				<div className="space-y-3 p-4">
					<div className="h-2 w-3/4 rounded bg-bg-weak-50" />
					<div className="h-2 w-full rounded bg-bg-weak-50" />
					<div className="h-2 w-5/6 rounded bg-bg-weak-50" />
				</div>
			</div>
			<div className="slide-in-from-bottom-2 fade-in flex animate-in items-center gap-3 rounded-xl border border-success-lighter bg-success-lighter p-4 duration-500">
				<div className="rounded-full bg-success-lighter p-2 text-success-base">
					<ShieldCheck size={20} />
				</div>
				<div>
					<div className="font-semibold text-sm text-text-strong-950">
						Signed & Verified
					</div>
					<div className="text-text-sub-600 text-xs">
						Mailed by{" "}
						<span className="font-medium font-mono">
							{domain || "your-domain.com"}
						</span>
					</div>
				</div>
			</div>
		</div>
	);
};
