"use client";

import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import { useState } from "react";

const copyToClipboard = async (text: string) => {
	try {
		await navigator.clipboard.writeText(text);
	} catch (err) {
		console.error("Failed to copy:", err);
	}
};

const highlightCode = (code: string) => {
	const lines = code.split("\n");
	return lines.map((line, lineIndex) => {
		// Basic syntax highlighting patterns
		const patterns = [
			// Strings (single and double quotes)
			{
				regex: /(["'`])(?:(?=(\\?))\2.)*?\1/g,
				className: "text-[#ce9178]",
			},
			// Comments
			{
				regex: /(\/\/.*$|\/\*[\s\S]*?\*\/|#.*$)/gm,
				className: "text-[#6a9955]",
			},
			// Keywords (common across languages)
			{
				regex:
					/\b(import|from|const|let|var|function|async|await|return|if|else|for|while|class|extends|new|this|package|func|type|interface|struct|public|private|static|final|try|catch|throw|use|namespace|require|def|print|<?php|<\?php)\b/g,
				className: "text-[#569cd6]",
			},
			// Numbers
			{
				regex: /\b\d+\.?\d*\b/g,
				className: "text-[#b5cea8]",
			},
			// Function calls
			{
				regex: /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g,
				className: "text-[#dcdcaa]",
			},
		];

		const parts: Array<{ text: string; className?: string }> = [];
		let lastIndex = 0;

		// Find all matches
		const matches: Array<{
			start: number;
			end: number;
			className: string;
		}> = [];

		patterns.forEach((pattern) => {
			const regex = new RegExp(pattern.regex.source, pattern.regex.flags);
			let match = regex.exec(line);
			while (match !== null) {
				matches.push({
					start: match.index,
					end: match.index + match[0].length,
					className: pattern.className,
				});
				match = regex.exec(line);
			}
		});

		// Sort matches by start position
		matches.sort((a, b) => a.start - b.start);

		// Merge overlapping matches (prioritize first match)
		const mergedMatches: Array<{
			start: number;
			end: number;
			className: string;
		}> = [];
		matches.forEach((match) => {
			const overlapping = mergedMatches.find(
				(m) => !(match.end <= m.start || match.start >= m.end),
			);
			if (!overlapping) {
				mergedMatches.push(match);
			}
		});

		// Build parts array
		mergedMatches.forEach((match) => {
			if (match.start > lastIndex) {
				parts.push({ text: line.slice(lastIndex, match.start) });
			}
			parts.push({
				text: line.slice(match.start, match.end),
				className: match.className,
			});
			lastIndex = Math.max(lastIndex, match.end);
		});

		if (lastIndex < line.length) {
			parts.push({ text: line.slice(lastIndex) });
		}

		if (parts.length === 0) {
			parts.push({ text: line });
		}

		return (
			<span key={lineIndex} className="block">
				{parts.map((part, partIndex) => (
					<span key={partIndex} className={part.className}>
						{part.text}
					</span>
				))}
				{line === "" && "\u00A0"}
			</span>
		);
	});
};

type SdkType = {
	id: string;
	name: string;
	icon: string;
	install: string;
	code: string;
};

const sdks: SdkType[] = [
	{
		id: "node",
		name: "Node.js",
		icon: "⚡",
		install: "npm install @reloop/sdk",
		code: `import Reloop from '@reloop/sdk';

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
	},
	{
		id: "go",
		name: "Go",
		icon: "🐹",
		install: "go get github.com/reloop/sdk-go",
		code: `package main

import (
  "fmt"
  "github.com/reloop/sdk-go"
)

func main() {
  client := reloop.NewClient("your-api-key")

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
	},
	{
		id: "php",
		name: "PHP",
		icon: "🐘",
		install: "composer require reloop/sdk",
		code: `<?php

require 'vendor/autoload.php';

use Reloop\\Reloop;

$reloop = new Reloop([
  'url' => 'https://api.reloop.sh',
  'key' => 'your-api-key'
]);

// Send an email
$result = $reloop->mail->send([
  'from' => 'sender@example.com',
  'to' => 'recipient@example.com',
  'subject' => 'Hello',
  'text' => 'Hello World!'
]);`,
	},
	{
		id: "python",
		name: "Python",
		icon: "🐍",
		install: "pip install reloop-sdk",
		code: `from reloop import Reloop

# Initialize the client
reloop = Reloop(
    url='https://api.reloop.sh',
    key='your-api-key'
)

# Send an email
result = reloop.mail.send(
    from_email='sender@example.com',
    to='recipient@example.com',
    subject='Hello',
    text='Hello World!'
)

print(result)`,
	},
];

export const Sdk = () => {
	const [selectedSdk, setSelectedSdk] = useState<SdkType>(sdks[0] as SdkType);

	return (
		<div className="border-stroke-soft-100 border-t">
			<div className="mx-auto max-w-7xl border-stroke-soft-100 border-r border-l">
				<div className="flex items-center justify-between border-stroke-soft-100 border-b px-10 py-4">
					<span className="text-sm text-text-sub-600">[02] SDK</span>
					<span className="text-sm text-text-sub-600">/ DEVELOPER TOOLS</span>
				</div>
				<div className="flex flex-col border-stroke-soft-100">
					{/* Header Section */}
					<div className="border-stroke-soft-100 border-b p-10">
						<h2 className="mb-3 font-semibold text-3xl text-text-strong-950">
							SDKs for every language
						</h2>
						<p className="max-w-2xl text-text-sub-600 leading-7">
							Get started quickly with our official SDKs. Choose your preferred
							language and start sending emails in minutes.
						</p>
					</div>

					{/* SDK Selection and Code Display */}
					<div className="flex flex-col border-stroke-soft-100">
						{/* Tabs */}
						<div className="flex items-center gap-1 border-stroke-soft-100 border-b px-6 py-2">
							{sdks.map((sdk) => (
								<button
									key={sdk.id}
									type="button"
									onClick={() => setSelectedSdk(sdk)}
									className={`flex items-center gap-2 rounded-t-lg border-b-2 px-4 py-2.5 transition-all ${
										selectedSdk.id === sdk.id
											? "border-stroke-soft-200 bg-bg-weak-50"
											: "border-transparent bg-transparent hover:bg-bg-weak-50"
									}`}
								>
									<span className="text-lg">{sdk.icon}</span>
									<span
										className={`font-semibold text-sm ${
											selectedSdk.id === sdk.id
												? "text-text-strong-950"
												: "text-text-sub-600"
										}`}
									>
										{sdk.name}
									</span>
								</button>
							))}
							<div className="ml-auto flex items-center gap-2">
								<Button.Root
									variant="neutral"
									mode="lighter"
									size="xsmall"
									onClick={() => copyToClipboard(selectedSdk.code)}
								>
									<Icon
										name="clipboard-copy"
										className="h-3.5 w-3.5 stroke-1 text-text-sub-600"
									/>
									Copy
								</Button.Root>
								<Button.Root variant="neutral" mode="lighter" size="xsmall">
									View Docs
									<Icon
										name="chevron-right"
										className="h-3.5 w-3.5 stroke-1 text-text-sub-600"
									/>
								</Button.Root>
							</div>
						</div>

						{/* Code Display */}
						<div className="flex-1 overflow-hidden bg-[#1e1e1e]">
							<div className="relative h-full overflow-auto">
								<div className="flex">
									{/* Line Numbers */}
									<div className="sticky left-0 z-10 border-stroke-soft-200 border-r bg-[#252526] px-4 py-4 text-right font-mono text-[#858585] text-xs leading-6">
										{selectedSdk.code.split("\n").map((_, index) => (
											<div key={index} className="select-none">
												{index + 1}
											</div>
										))}
									</div>
									{/* Code Content */}
									<div className="flex-1 px-6 py-4">
										<pre className="font-mono text-sm leading-6">
											<code className="block text-[#d4d4d4]">
												{highlightCode(selectedSdk.code)}
											</code>
										</pre>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Sdk;
