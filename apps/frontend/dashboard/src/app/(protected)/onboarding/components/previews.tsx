"use client";

import { CodeBlock } from "@reloop/ui/code-block";
import { Icon } from "@reloop/ui/icon";
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
								<img
									src={logo}
									alt="Logo"
									className="h-5 w-5 rounded-sm object-cover"
								/>
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
	const domainName = domain ? domain.split(".")[0] || "Sender" : "Sender";
	const domainHost = domain ? domain.split(".").slice(-2).join(".") || "" : "";
	const displayDomain = domain || "";
	const senderEmail = domain ? `hello@${domainHost}` : "";
	const toEmail = "sundar@google.com";
	const avatarInitial = domainName[0]?.toUpperCase() || "S";

	return (
		<div className="absolute top-10 left-10">
			<div className="w-[1000px] transform overflow-hidden rounded-2xl border border-stroke-soft-200 bg-bg-white-0 shadow-2xl transition-all">
				{/* Browser Window Header */}
				<div className="flex items-center gap-2 border-stroke-soft-100 border-b bg-bg-weak-50 px-4 py-3">
					<div className="flex gap-1.5">
						<div className="h-3 w-3 rounded-full bg-error-base/80" />
						<div className="h-3 w-3 rounded-full bg-warning-base/80" />
						<div className="h-3 w-3 rounded-full bg-success-base/80" />
					</div>
					<div className="ml-3 h-2.5 max-w-[140px] flex-1 rounded-full bg-bg-soft-200" />
				</div>

				{/* Email Client Content */}
				<div className="relative bg-bg-white-0 p-6">
					{/* Subject Line */}
					<div className="mb-3 ml-14 flex w-auto justify-start gap-3">
						<span className="font-medium text-text-strong-800">
							Black Friday is here. 55% off on all products.
						</span>
						<div className="flex items-center gap-1 rounded-md border border-stroke-soft-200 bg-bg-weak-50 px-1.5 py-0">
							<span className="text-[11px] text-text-soft-400">Inbox</span>
							<span className="text-[10px] text-text-soft-400">×</span>
						</div>
					</div>

					{/* Sender Row */}
					<div className="flex items-start gap-4">
						{/* Avatar */}
						{domain ? (
							<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-stroke-soft-100 bg-bg-soft-200 font-bold text-sm">
								{avatarInitial}
							</div>
						) : (
							<div className="h-10 w-10 rounded-full bg-bg-soft-200" />
						)}

						<div className="relative z-10 min-w-0 flex-1">
							{/* Sender Name & Email */}
							<div className="mb-1 flex items-center gap-2">
								{domain ? (
									<>
										<span className="font-bold text-sm text-text-strong-950">
											{domainName}
										</span>
										<span className="hidden text-text-soft-400 text-xs sm:inline">
											&lt;{senderEmail}&gt;
										</span>
									</>
								) : (
									<div className="mb-1 h-4 w-32 rounded bg-bg-soft-200" />
								)}
								<span className="ml-auto cursor-pointer text-primary-base text-xs sm:ml-2">
									Unsubscribe
								</span>
							</div>

							<div className="mb-2 flex cursor-pointer items-center gap-1 text-text-soft-400 text-xs">
								to me{" "}
								<div className="mt-0.5 h-0 w-0 border-t-[4px] border-t-text-soft-400 border-r-[3px] border-r-transparent border-l-[3px] border-l-transparent" />
							</div>

							{/* Email Details Dropdown */}
							<div className="fade-in slide-in-from-top-2 relative mt-2 animate-in duration-500">
								<div className="relative rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-4 text-text-sub-600 text-xs leading-relaxed shadow-lg shadow-stroke-soft-200/50">
									{/* Triangle Pointer */}
									<div className="-top-1.5 absolute left-3 h-3 w-3 rotate-45 transform border-stroke-soft-200 border-t border-l bg-bg-white-0" />

									<div className="grid grid-cols-[100px_1fr] gap-y-2.5">
										<div className="pr-3 text-right text-text-soft-400">
											from:
										</div>
										<div className="font-medium text-text-strong-950">
											{domain ? (
												<>
													{domainName}{" "}
													<span className="font-normal text-text-sub-600">
														&lt;{senderEmail}&gt;
													</span>
												</>
											) : (
												<div className="h-4 w-48 rounded bg-bg-soft-200" />
											)}
										</div>

										<div className="pr-3 text-right text-text-soft-400">
											to:
										</div>
										<div className="text-text-strong-950">{toEmail}</div>

										<div className="pr-3 text-right text-text-soft-400">
											date:
										</div>
										<div className="text-text-sub-600">
											{new Date().toLocaleDateString("en-US", {
												month: "short",
												day: "numeric",
												year: "numeric",
											})}
											,{" "}
											{new Date().toLocaleTimeString("en-US", {
												hour: "numeric",
												minute: "2-digit",
												hour12: true,
											})}
										</div>

										<div className="pr-3 text-right text-text-soft-400">
											subject:
										</div>
										<div className="text-text-strong-950">
											Black Friday is here. 55% off...
										</div>

										{/* Verification Fields */}
										<div className="pr-3 text-right text-text-soft-400">
											mailed-by:
										</div>
										<div className="flex items-center gap-2">
											{domain ? (
												<span className="text-text-strong-950">
													{displayDomain}
												</span>
											) : (
												<div className="h-4 w-32 rounded bg-bg-soft-200" />
											)}
										</div>

										<div className="pr-3 text-right text-text-soft-400">
											signed-by:
										</div>
										<div className="flex items-center gap-2">
											{domain ? (
												<span className="text-text-strong-950">
													{displayDomain}
												</span>
											) : (
												<div className="h-4 w-32 rounded bg-bg-soft-200" />
											)}
										</div>

										<div className="pr-3 text-right text-text-soft-400">
											security:
										</div>

										<div className="flex items-center gap-1.5 text-text-sub-600">
											<Icon
												name="shield-check"
												className="h-3 w-3 text-text-soft-400"
											/>
											<span>Standard encryption (TLS)</span>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Email Body Skeleton */}
					<div className="mt-8 space-y-4 opacity-40 blur-[0.5px]">
						<div className="h-4 w-full rounded bg-bg-soft-200" />
						<div className="h-4 w-11/12 rounded bg-bg-soft-200" />
						<div className="h-4 w-4/5 rounded bg-bg-soft-200" />

						<div className="mt-8 flex h-40 w-full items-center justify-center rounded-xl border border-stroke-soft-100 bg-bg-weak-50 text-text-soft-400">
							<Icon name="info" />
						</div>

						<div className="mt-6 flex justify-center">
							<div className="h-10 w-32 rounded-lg bg-primary-lighter" />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
