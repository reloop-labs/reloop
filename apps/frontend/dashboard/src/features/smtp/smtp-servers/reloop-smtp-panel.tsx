import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import * as Tooltip from "@reloop/ui/tooltip";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { buildReloopAiPrompt } from "#/features/dashboard/page-header/copy-prompt-button";
import { SMTP_USER } from "../smtp-code-examples";
import { SmtpCodePanel } from "../smtp-code-panel";

/** All supported SMTP ports, shown slash-separated in the credentials table. */
export const SMTP_PORTS = "465 / 587 / 2587 / 2465";

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

/** Expanded body of the built-in "Reloop SMTP" row: credentials + samples. */
export function ReloopSmtpPanel({ smtpHost }: { smtpHost: string }) {
	const router = useRouter();

	return (
		<div className="grid grid-cols-1 gap-6 border-stroke-soft-100 border-t bg-bg-weak-50/40 p-4 lg:grid-cols-12 dark:border-stroke-soft-100/40 dark:bg-white/[0.02]">
			<div className="space-y-3 lg:col-span-5">
				<p className="text-text-sub-600 text-xs leading-relaxed">
					Point any SMTP client or library at Reloop and authenticate with an
					API key. No server of your own needed.
				</p>
				<div className="overflow-hidden rounded-xl border border-stroke-soft-100 bg-bg-white-0 dark:border-stroke-soft-100/40 dark:bg-black">
					<CredentialRow label="Host" value={smtpHost} mono />
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
								variant="neutral"
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
				<div className="flex flex-wrap items-center gap-2">
					<CopySkillPromptButton />
					<span className="text-[11px] text-text-soft-400">
						Paste into your coding agent to wire Reloop SMTP into your app.
					</span>
				</div>
			</div>
			<div className="min-w-0 lg:col-span-7">
				<SmtpCodePanel apiKeyPlaceholder="YOUR_API_KEY" smtpHost={smtpHost} />
			</div>
		</div>
	);
}
