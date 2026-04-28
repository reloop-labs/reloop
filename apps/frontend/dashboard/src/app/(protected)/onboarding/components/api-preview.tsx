"use client";

import { CodeBlock } from "@reloop/ui/code-block";
import { useTheme } from "next-themes";
import { parseAsString, useQueryState } from "nuqs";
import { LanguageTabs } from "./language-tabs";

interface ApiPreviewProps {
	apiKey?: string;
}

type LanguageCode = "nodejs" | "go" | "php" | "python";

const buildCodeExamples = (
	apiKey: string,
): Record<LanguageCode, { code: string; lang: string }> => {
	const keyDisplay = apiKey || "YOUR_RELOOP_API_KEY";

	return {
		nodejs: {
			code: `import Reloop from 'reloop-email';

const reloop = new Reloop(process.env.RELOOP_API_KEY);
// RELOOP_API_KEY=${keyDisplay}

const result = await reloop.mail.send({
  from: 'sender@example.com',
  to: 'recipient@example.com',
  subject: 'Hello from Reloop!',
  text: 'Hello World!',
});

console.log(result);`,
			lang: "typescript",
		},
		python: {
			code: `import os
from reloop import Reloop

# RELOOP_API_KEY=${keyDisplay}
client = Reloop(os.environ["RELOOP_API_KEY"])

result = client.mail.send(
    from_email="sender@example.com",
    to="recipient@example.com",
    subject="Hello from Reloop!",
    text="Hello World!",
)

print(result)`,
			lang: "python",
		},
		go: {
			code: `package main

import (
  "fmt"
  "os"
  "github.com/reloop/reloop-go"
)

// RELOOP_API_KEY=${keyDisplay}
func main() {
  client := reloop.NewClient(os.Getenv("RELOOP_API_KEY"))

  result, err := client.Mail.Send(&reloop.MailRequest{
    From:    "sender@example.com",
    To:      "recipient@example.com",
    Subject: "Hello from Reloop!",
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

// RELOOP_API_KEY=${keyDisplay}
$client = new ReloopClient(getenv('RELOOP_API_KEY'));

$result = $client->mail->send([
  'from'    => 'sender@example.com',
  'to'      => 'recipient@example.com',
  'subject' => 'Hello from Reloop!',
  'text'    => 'Hello World!',
]);

echo json_encode($result, JSON_PRETTY_PRINT);`,
			lang: "php",
		},
	};
};

export const ApiPreview = ({ apiKey = "" }: ApiPreviewProps) => {
	const { resolvedTheme } = useTheme();
	// Sync language state with the left panel via nuqs
	const [selectedLang, setSelectedLang] = useQueryState(
		"lang",
		parseAsString.withDefault("nodejs"),
	);

	const lang = (selectedLang as LanguageCode) || "nodejs";
	const codeExamples = buildCodeExamples(apiKey);
	const currentCode = codeExamples[lang];

	const handleLanguageChange = (value: string) => {
		setSelectedLang(value);
	};

	return (
		<div className="flex h-full flex-col">
			{/* Window chrome */}
			<div className="flex items-center gap-4 border-stroke-soft-100 border-b bg-bg-white-0 p-3">
				<div className="flex gap-1.5">
					<div className="h-3 w-3 rounded-full bg-error-base/80" />
					<div className="h-3 w-3 rounded-full bg-warning-base/80" />
					<div className="h-3 w-3 rounded-full bg-success-base/80" />
				</div>
			</div>

			{/* Language tabs */}
			<LanguageTabs
				defaultValue={lang}
				value={lang}
				onValueChange={handleLanguageChange}
			/>

			{/* Code */}
			<div className="mt-2 max-h-[calc(100vh-14rem)] flex-1 overflow-y-auto">
				<CodeBlock
					code={currentCode.code}
					lang={currentCode.lang}
					theme={resolvedTheme === "light" ? "rose-pine-dawn" : "vesper"}
				/>
			</div>
		</div>
	);
};
