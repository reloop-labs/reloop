"use client";

import { CodeBlock } from "@reloop/ui/code-block";
import { useTheme } from "next-themes";
import { useState } from "react";
import { LanguageTabs } from "./language-tabs";

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
		<div className="flex h-full flex-col">
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
			<div className="mt-2 max-h-96 flex-1 overflow-y-auto">
				<CodeBlock
					code={currentCode.code}
					lang={currentCode.lang}
					theme={resolvedTheme === "light" ? "rose-pine-dawn" : "vesper"}
				/>
			</div>
		</div>
	);
};
