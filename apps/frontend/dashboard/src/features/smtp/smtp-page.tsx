import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import * as Tooltip from "@reloop/ui/tooltip";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";

import { ActionKbd } from "#/features/dashboard/keyboard-shortcuts-reveal";
import { buildReloopAiPrompt } from "#/features/dashboard/page-header/copy-prompt-button";
import { SMTP_HOST, SMTP_USER } from "./smtp-code-examples";
import { SmtpCodePanel } from "./smtp-code-panel";

const DOCS_URL = "https://reloop.sh/docs/examples/smtp/introduction";

/** All supported SMTP ports, shown slash-separated in the credentials table. */
const SMTP_PORTS = "465 / 587 / 2587 / 2465";

function CopySkillPromptButton({ className }: { className?: string }) {
	const [copied, setCopied] = useState(false);

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(buildReloopAiPrompt());
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch {
			// ignore
		}
	};

	return (
		<button
			type="button"
			onClick={handleCopy}
			className={cn(
				"inline-flex h-9 cursor-pointer items-center gap-2 rounded-full border border-stroke-soft-100 bg-bg-white-0 px-3.5 font-medium text-text-strong-950 text-xs hover:bg-bg-weak-50 dark:border-stroke-soft-100/40 dark:bg-bg-weak-50/50 dark:text-white dark:hover:bg-bg-weak-50",
				className,
			)}
		>
			<svg
				viewBox="0 0 16 16"
				className="h-4 w-4 shrink-0 text-text-sub-600 dark:text-white/80"
				aria-hidden
			>
				<path
					fill="currentColor"
					d="M6.75 14a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5m3.75 0a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5m3.75 0a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5m-7.5-3.25a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5m7.5 0a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5M8.25.5C9.22.5 10 1.28 10 2.25V3H8.5v-.75A.25.25 0 0 0 8.25 2h-5.5a.25.25 0 0 0-.25.25v7.5c0 .14.11.25.25.25H4.5v1.5H2.75C1.78 11.5 1 10.72 1 9.75v-7.5C1 1.28 1.78.5 2.75.5zm-1.5 7.25a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5m7.5 0a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5M6.75 4.5a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5m3.75 0a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5m3.75 0a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5"
				/>
			</svg>
			<span>{copied ? "Copied!" : "Copy prompt"}</span>
		</button>
	);
}

function CopyButton({
	value,
	className,
}: {
	value: string;
	className?: string;
}) {
	const [copied, setCopied] = useState(false);

	const handleCopy = useCallback(
		async (e: React.MouseEvent) => {
			e.stopPropagation();
			try {
				await navigator.clipboard.writeText(value);
				setCopied(true);
				setTimeout(() => setCopied(false), 2000);
			} catch {
				// ignore
			}
		},
		[value],
	);

	return (
		<button
			type="button"
			onClick={handleCopy}
			className={cn(
				"flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-text-sub-600 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950",
				copied && "text-success-base",
				className,
			)}
			title={copied ? "Copied" : "Copy"}
		>
			<Icon name={copied ? "check" : "copy"} className="h-3.5 w-3.5" />
		</button>
	);
}

function CredentialRow({
	label,
	value,
	mono,
	tooltip,
	trailing,
	action,
	copyable = true,
}: {
	label: string;
	value: string;
	mono?: boolean;
	tooltip?: string;
	trailing?: React.ReactNode;
	/** Replaces the copy button when set (e.g. Get API key on password). */
	action?: React.ReactNode;
	copyable?: boolean;
}) {
	const [copied, setCopied] = useState(false);

	const handleCopy = useCallback(async () => {
		if (!copyable) return;
		try {
			await navigator.clipboard.writeText(value);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch {
			// ignore
		}
	}, [value, copyable]);

	return (
		<div className="flex items-center gap-3 border-stroke-soft-100 border-b px-4 py-3 last:border-b-0 dark:border-stroke-soft-100/40">
			<div className="min-w-[88px] shrink-0">
				<div className="flex items-center gap-1">
					<span className="font-medium text-text-sub-600 text-xs">{label}</span>
					{tooltip ? (
						<Tooltip.Root>
							<Tooltip.Trigger asChild>
								<button type="button" className="text-text-soft-400">
									<Icon name="info-outline" className="h-3 w-3" />
								</button>
							</Tooltip.Trigger>
							<Tooltip.Content side="top">
								<p className="max-w-[220px] text-xs">{tooltip}</p>
							</Tooltip.Content>
						</Tooltip.Root>
					) : null}
				</div>
			</div>
			{copyable ? (
				<button
					type="button"
					onClick={handleCopy}
					className="group flex min-w-0 flex-1 items-center gap-2 text-left"
				>
					<span
						className={cn(
							"truncate font-medium text-sm text-text-strong-950 transition-colors",
							mono && "font-mono",
							copied && "text-success-base",
						)}
					>
						{copied ? "Copied" : value}
					</span>
				</button>
			) : (
				<span
					className={cn(
						"min-w-0 flex-1 truncate font-medium text-sm text-text-strong-950",
						mono && "font-mono",
					)}
				>
					{value}
				</span>
			)}
			{trailing}
			{action ?? (copyable ? <CopyButton value={value} /> : null)}
		</div>
	);
}

export function SmtpPage() {
	const router = useRouter();

	useHotkeys(
		"d",
		(e) => {
			e.preventDefault();
			window.open(DOCS_URL, "_blank");
		},
		{ enableOnFormTags: true },
	);

	useHotkeys(
		"k",
		(e) => {
			e.preventDefault();
			router.push("/api-keys/create");
		},
		{ enableOnFormTags: true },
	);

	return (
		<div className="mx-auto max-w-6xl space-y-6 p-6 lg:p-8">
			{/* Header — same family as API keys / webhooks */}
			<div className="flex flex-col gap-4 pt-2 pb-4 sm:flex-row sm:items-start sm:justify-between">
				<div>
					<div className="flex items-center gap-2.5">
						<Icon
							name="smtp"
							className="h-6 w-6 shrink-0 text-text-strong-950"
						/>
						<h1 className="font-semibold text-[26px] text-text-strong-950 tracking-tight">
							SMTP Relay
						</h1>
					</div>
					<p className="mt-1 text-sm text-text-sub-600">
						Send email from any SMTP client using your Reloop API key.
					</p>
				</div>

				<div className="flex shrink-0 flex-wrap items-center gap-2">
					<Button.Root
						type="button"
						variant="neutral"
						mode="stroke"
						size="small"
						onClick={() => window.open(DOCS_URL, "_blank")}
						className="gap-1.5 rounded-xl"
					>
						<span>Documentation</span>
						<ActionKbd className="ml-0.5 w-auto min-w-4 px-1">D</ActionKbd>
					</Button.Root>
					<FancyButton.Root
						type="button"
						variant="blue"
						size="small"
						onClick={() => router.push("/api-keys/create")}
						className="gap-1.5 rounded-xl"
					>
						<Icon name="key-new" className="h-4 w-4" />
						<span>Get API key</span>
						<ActionKbd className="ml-0.5 w-auto min-w-4 border-white/25 bg-white/15 px-1 text-white shadow-[0_1.5px_0_0_rgba(0,0,0,0.2)] dark:border-white/25 dark:bg-white/15 dark:text-white dark:shadow-[0_1.5px_0_0_rgba(0,0,0,0.35)]">
							K
						</ActionKbd>
					</FancyButton.Root>
				</div>
			</div>

			{/* Agent Skill Integration Banner */}
			<div className="rounded-2xl border border-[#B8D9FA] bg-[#F0F7FF] p-5 sm:p-6 dark:border-blue-900/60 dark:bg-[#04162E]">
				<div className="flex items-center gap-2 font-bold text-[#1868DF] text-xs uppercase tracking-wider dark:text-blue-400">
					<Icon name="robot" className="h-4 w-4" />
					<span>Agent Skill</span>
				</div>
				<p className="mt-2.5 max-w-3xl font-medium text-paragraph-sm text-text-strong-950 leading-relaxed dark:text-blue-50/90">
					If you're looking to adopt Reloop SMTP for the first time in an
					existing app, we've put together a Skill you can use to have your
					agent walk you through the process.
				</p>
				<div className="mt-4">
					<CopySkillPromptButton />
				</div>
			</div>

			<div className="grid grid-cols-1 gap-8 pb-10 lg:grid-cols-12">
				{/* Credentials */}
				<div className="space-y-4 lg:col-span-5">
					<div>
						<h2 className="font-semibold text-lg text-text-strong-950 tracking-tight">
							Credentials
						</h2>
						<p className="mt-1 text-text-sub-600 text-xs leading-relaxed">
							Point your mail library at Reloop and authenticate with an API
							key.
						</p>
					</div>

					<div className="overflow-hidden rounded-2xl border border-stroke-soft-100 bg-bg-white-0 dark:border-stroke-soft-100/40">
						<CredentialRow label="Host" value={SMTP_HOST} mono />
						<CredentialRow
							label="Port"
							value={SMTP_PORTS}
							mono
							tooltip="465 SSL/TLS · 587 STARTTLS · 2587 STARTTLS · 2465 TLS"
						/>
						<CredentialRow label="User" value={SMTP_USER} mono />
						<CredentialRow
							label="Password"
							value="YOUR_API_KEY"
							mono
							copyable={false}
							tooltip="Use any workspace API key as the SMTP password."
							action={
								<FancyButton.Root
									type="button"
									variant="blue"
									size="xsmall"
									onClick={() => router.push("/api-keys/create")}
									className="gap-1.5 rounded-lg"
								>
									<Icon name="key-new" className="h-3.5 w-3.5" />
									Get API key
								</FancyButton.Root>
							}
						/>
					</div>

					{/* Password tip */}
					<div className="rounded-xl border border-[#B8D9FA] bg-[#EBF4FE] p-4 text-[#0C4A8C] text-xs leading-relaxed dark:border-blue-800/40 dark:bg-blue-950/30 dark:text-blue-200">
						<span className="font-bold text-[#0C4A8C] dark:text-blue-100">
							Tip:
						</span>{" "}
						Use a Reloop API key as the SMTP password — not your account
						password.{" "}
						<button
							type="button"
							onClick={() => router.push("/api-keys")}
							className="font-medium underline underline-offset-2 hover:opacity-80"
						>
							Manage API keys
						</button>
					</div>
				</div>

				{/* Code samples */}
				<div className="min-w-0 lg:sticky lg:top-6 lg:col-span-7 lg:self-start">
					<SmtpCodePanel apiKeyPlaceholder="YOUR_API_KEY" />
				</div>
			</div>
		</div>
	);
}
