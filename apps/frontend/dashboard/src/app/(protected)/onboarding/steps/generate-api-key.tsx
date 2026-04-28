"use client";

import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { CodeBlock } from "@reloop/ui/code-block";
import { Icon } from "@reloop/ui/icon";
import axios from "axios";
import {
	CheckCircle2,
	Copy,
	Loader2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { parseAsString, useQueryState } from "nuqs";
import { useState } from "react";
import { toast } from "sonner";
import { LanguageTabs } from "../components/language-tabs";

type LanguageCode = "nodejs" | "go" | "php" | "python";

const installCommands: Record<LanguageCode, string> = {
	nodejs: "npm install reloop-email",
	python: "pip install reloop",
	go: "go get github.com/reloop/reloop-go",
	php: "composer require reloop/reloop-php",
};

const sendEmailCode: Record<LanguageCode, { code: string; lang: string }> = {
	nodejs: {
		code: `import Reloop from 'reloop-email';

const reloop = new Reloop(process.env.RELOOP_API_KEY);

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

use Reloop\ReloopClient;

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

// ─── Sub-components ────────────────────────────────────────────────────────

function StepCard({
	number,
	title,
	subtitle,
	children,
}: {
	number: number;
	title: string;
	subtitle?: string;
	children: React.ReactNode;
}) {
	return (
		<div className="flex flex-col gap-3">
			<div className="flex items-center gap-2.5">
				<div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-bg-weak-50 text-[11px] font-semibold text-text-sub-600 ring-1 ring-stroke-soft-200">
					{number}
				</div>
				<div>
					<p className="font-medium text-label-sm text-text-strong-950">
						{title}
					</p>
					{subtitle && (
						<p className="text-paragraph-xs text-text-soft-400">{subtitle}</p>
					)}
				</div>
			</div>
			<div className="pl-[30px]">{children}</div>
		</div>
	);
}

function CopyCodeBlock({
	code,
	lang,
	copyValue,
}: {
	code: string;
	lang: string;
	copyValue?: string;
}) {
	const [copied, setCopied] = useState(false);
	const { resolvedTheme } = useTheme();

	const handleCopy = () => {
		navigator.clipboard.writeText(copyValue ?? code);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<div className="group relative overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-weak-50">
			<div className="max-h-52 overflow-auto">
				<CodeBlock
					code={code}
					lang={lang}
					theme={resolvedTheme === "light" ? "rose-pine-dawn" : "vesper"}
				/>
			</div>
			<button
				type="button"
				onClick={handleCopy}
				className={cn(
					"absolute top-2 right-2 flex items-center gap-1.5 rounded-md border border-stroke-soft-200 bg-bg-white-0 px-2 py-1",
					"text-label-xs text-text-sub-600 shadow-xs transition-all duration-150",
					"opacity-0 group-hover:opacity-100 hover:border-stroke-soft-300 hover:text-text-strong-950",
				)}
			>
				{copied ? (
					<CheckCircle2 className="h-3 w-3 text-success-base" />
				) : (
					<Copy className="h-3 w-3" />
				)}
				{copied ? "Copied!" : "Copy"}
			</button>
		</div>
	);
}

// ─── Main Component ─────────────────────────────────────────────────────────

export const GenerateApiKeyStep = () => {
	const [apiKey, setApiKey] = useQueryState(
		"apiKey",
		parseAsString.withDefault(""),
	);
	const [selectedLang, setSelectedLang] = useQueryState(
		"lang",
		parseAsString.withDefault("nodejs"),
	);
	const router = useRouter();
	const [loading, setLoading] = useState(false);

	const lang = (selectedLang as LanguageCode) || "nodejs";

	const generateKey = async () => {
		setLoading(true);
		try {
			const response = await axios.post("/api/api-key/v1/", {
				name: "Default API Key",
			});
			setApiKey(response.data.key);
		} catch (error) {
			const errorMessage = axios.isAxiosError(error)
				? error.response?.data?.message || "Failed to generate API key"
				: "Failed to generate API key";
			toast.error(errorMessage);
		} finally {
			setLoading(false);
		}
	};

	const handleLanguageChange = (value: string) => {
		setSelectedLang(value);
	};

	return (
		<div className="fade-in h-full animate-in duration-500">
			<AnimatePresence mode="wait">
				{!apiKey ? (
					/* ── Pre-generation state ── */
					<motion.div
						key="pre-generate"
						initial={{ opacity: 0, y: 8 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -8 }}
						transition={{ duration: 0.25 }}
						className="flex flex-col items-center justify-center gap-6 py-8 text-center"
					>
						<div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-stroke-soft-200 bg-bg-weak-50 shadow-xs">
							<Icon name="key" className="h-6 w-6 text-text-sub-600" />
						</div>
						<div className="space-y-1.5">
							<h2 className="font-semibold text-label-lg text-text-strong-950">
								Generate your API key
							</h2>
							<p className="max-w-xs text-paragraph-sm text-text-soft-400">
								Your secret key authenticates your application with the Reloop
								API. Keep it safe — you'll only see it once.
							</p>
						</div>
						<Button.Root
							variant="neutral"
							mode="filled"
							onClick={generateKey}
							disabled={loading}
							className="w-full max-w-xs"
						>
							{loading ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : (
								<Icon name="key" className="h-4 w-4" />
							)}
							{loading ? "Generating…" : "Generate Secret Key"}
						</Button.Root>
					</motion.div>
				) : (
					/* ── Post-generation: 3-step guide ── */
					<motion.div
						key="post-generate"
						initial={{ opacity: 0, y: 8 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -8 }}
						transition={{ duration: 0.25 }}
						className="flex h-full flex-1 flex-col gap-6"
					>
						{/* API Key display — always visible */}
						<div className="flex flex-col gap-1.5">
							<p className="text-label-xs text-text-soft-400 uppercase tracking-wide">
								Your API Key
							</p>
							<CopyCodeBlock
								code={apiKey}
								lang="bash"
								copyValue={apiKey}
							/>
						</div>

						{/* Language selector */}
						<div className="flex flex-col gap-2">
							<p className="text-label-xs text-text-soft-400 uppercase tracking-wide">
								Select your language
							</p>
							<LanguageTabs
								defaultValue={lang}
								value={lang}
								onValueChange={handleLanguageChange}
							/>
						</div>

						{/* 3-step cards */}
						<div className="flex flex-col gap-5">
							{/* Step 1 — Install */}
							<StepCard
								number={1}
								title="Install the SDK"
								subtitle="Add the Reloop package to your project"
							>
								<CopyCodeBlock
									code={installCommands[lang]}
									lang="bash"
								/>
							</StepCard>

							{/* Step 2 — ENV */}
							<StepCard
								number={2}
								title="Set your environment variable"
								subtitle="Add your secret key to your .env file"
							>
								<CopyCodeBlock
									code={`RELOOP_API_KEY=${apiKey}`}
									lang="bash"
									copyValue={`RELOOP_API_KEY=${apiKey}`}
								/>
							</StepCard>

							{/* Step 3 — Send email */}
							<StepCard
								number={3}
								title="Send your first email"
								subtitle="Use the SDK to send a transactional email"
							>
								<CopyCodeBlock
									code={sendEmailCode[lang].code}
									lang={sendEmailCode[lang].lang}
								/>
							</StepCard>
						</div>

						{/* CTA */}
						<div className="pt-2">
							<Button.Root
								variant="neutral"
								mode="filled"
								className="w-full"
								onClick={() => router.push("/")}
							>
								<Button.Icon>
									<Icon name="check-circle" className="h-4 w-4" />
								</Button.Icon>
								Go to Dashboard
							</Button.Root>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
};
