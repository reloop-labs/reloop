"use client";

import { StatusPill } from "@fe/console/components/ui/status-pill";
import { adminGet } from "@fe/console/lib/admin-api";
import {
	formatDateTime,
	formatRecipients,
	formatRelativeTime,
} from "@fe/console/lib/format";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as Drawer from "@reloop/ui/drawer";
import { Icon } from "@reloop/ui/icon";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";

export type EmailDetailData = {
	id: string;
	messageId: string;
	organizationId: string;
	organizationName?: string | null;
	domainId: string;
	domainName?: string | null;
	userId?: string | null;
	apikeyId?: string | null;
	fromEmail: string;
	fromName?: string | null;
	toEmails: string[] | unknown;
	ccEmails?: string[] | unknown;
	bccEmails?: string[] | unknown;
	replyTo?: string | null;
	subject: string;
	textBody?: string | null;
	htmlBody?: string | null;
	rawMessage?: string | null;
	status: string;
	priority?: string;
	errorMessage?: string | null;
	provider: string;
	providerMessageId?: string | null;
	size: number;
	headers?: Record<string, string> | null;
	sentAt?: string | Date | null;
	deliveredAt?: string | Date | null;
	failedAt?: string | Date | null;
	createdAt: string | Date;
	updatedAt?: string | Date;
	events?: {
		id: string;
		type: string;
		metadata?: Record<string, unknown> | null;
		createdAt: string | Date;
	}[];
};

function formatBytes(bytes: number): string {
	if (bytes === 0) return "0 B";
	const k = 1024;
	const sizes = ["B", "KB", "MB", "GB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return `${Number.parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`;
}

function formatHtml(html: string): string {
	if (!html) return "";
	const cleanHtml = html.replace(/>\s*</g, ">\n<");
	const lines = cleanHtml.split("\n");
	let indentLevel = 0;
	let formatted = "";
	const tab = "  ";

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i]?.trim();
		if (!line) continue;

		const isClosing = line.startsWith("</");
		const isSelfClosing =
			line.startsWith("<!") ||
			line.startsWith("<?") ||
			line.endsWith("/>") ||
			/^<(img|br|hr|input|meta|link|source|col|embed|area|base|param|track|wbr)/i.test(
				line,
			);

		if (isClosing) {
			indentLevel = Math.max(0, indentLevel - 1);
		}

		formatted += (formatted ? "\n" : "") + tab.repeat(indentLevel) + line;

		if (!isClosing && !isSelfClosing && line.startsWith("<")) {
			const tagMatch = line.match(/^<([a-zA-Z0-9:-]+)/);
			if (tagMatch) {
				const tagName = tagMatch[1];
				const closingTag = `</${tagName}>`;
				if (!line.includes(closingTag)) {
					indentLevel++;
				}
			}
		}
	}

	return formatted;
}

function classifyError(msg: string) {
	const m = msg.toLowerCase();
	if (
		m.includes("535") ||
		m.includes("authentication") ||
		m.includes("auth failed") ||
		m.includes("invalid credentials")
	) {
		return {
			category: "Authentication Failure",
			summary: "SMTP credentials were rejected by the mail server.",
			fixes: [
				"Verify SMTP credentials and API key",
				"Ensure sending permissions are configured",
			],
		};
	}
	if (
		m.includes("dns") ||
		m.includes("no mx") ||
		m.includes("could not resolve") ||
		m.includes("domain not found")
	) {
		return {
			category: "DNS Resolution Error",
			summary: "Recipient domain has no valid MX records or is unreachable.",
			fixes: [
				"Check recipient address domain spelling",
				"Verify recipient MX records via DNS lookup",
			],
		};
	}
	if (
		m.includes("550") ||
		m.includes("551") ||
		m.includes("bounce") ||
		m.includes("user unknown") ||
		m.includes("mailbox not found") ||
		m.includes("does not exist")
	) {
		return {
			category: "Mailbox Rejected",
			summary: "Receiving mail server rejected the recipient mailbox.",
			fixes: [
				"Confirm recipient address exists and is active",
				"Check domain SPF, DKIM, and DMARC status",
			],
		};
	}
	if (m.includes("spam") || m.includes("blocked") || m.includes("policy")) {
		return {
			category: "Spam / Policy Block",
			summary: "Delivery was rejected by a spam filter or server policy.",
			fixes: [
				"Verify sender reputation and IP blocklist status",
				"Review email content and authentication records",
			],
		};
	}
	if (m.includes("rate limit") || m.includes("quota") || m.includes("421")) {
		return {
			category: "Rate Limit Exceeded",
			summary: "Sending rate limit exceeded on provider or remote host.",
			fixes: [
				"Throttle outbound sending volume",
				"Review sending limits on organization",
			],
		};
	}
	return {
		category: "Delivery Failure",
		summary: "Delivery could not be completed.",
		fixes: ["Review SMTP response and logs for additional context"],
	};
}

export function EmailDetailDrawer({
	emailId,
	open,
	onOpenChange,
}: {
	emailId: string | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const [activeTab, setActiveTab] = useState<
		"preview" | "plain" | "html" | "raw" | "headers" | "timeline" | "insights"
	>("preview");
	const [previewTheme, setPreviewTheme] = useState<"light" | "dark">("light");

	const { data: email, isLoading } = useSWR<EmailDetailData>(
		open && emailId ? `/emails/${emailId}` : null,
		() => adminGet<EmailDetailData>(`/emails/${emailId}`),
	);

	const copyToClipboard = (text: string, label: string) => {
		navigator.clipboard.writeText(text);
		toast.success(`${label} copied to clipboard`);
	};

	const errorDiagnostic = useMemo(() => {
		if (!email?.errorMessage) return null;
		return classifyError(email.errorMessage);
	}, [email?.errorMessage]);

	const insights = useMemo(() => {
		if (!email) return [];
		const list: {
			title: string;
			passed: boolean;
			status: string;
			description: string;
		}[] = [];

		// Subject check
		const subLen = email.subject?.trim().length || 0;
		if (subLen > 0 && subLen <= 60) {
			list.push({
				title: "Optimal Subject Length",
				passed: true,
				status: `${subLen} chars`,
				description:
					"Subject line is concise and fits nicely on mobile and desktop email clients.",
			});
		} else if (subLen === 0) {
			list.push({
				title: "Subject Line Missing",
				passed: false,
				status: "Empty subject",
				description:
					"Emails without a subject line are frequently flagged as spam.",
			});
		} else {
			list.push({
				title: "Long Subject Line",
				passed: false,
				status: `${subLen} chars (>60)`,
				description:
					"Long subjects get truncated on mobile clients. Consider shortening under 60 characters.",
			});
		}

		// Body size check (< 102 KB)
		const sizeBytes = email.size || (email.htmlBody?.length ?? 0);
		if (sizeBytes < 102 * 1024) {
			list.push({
				title: "Under Gmail 102 KB Clipping Limit",
				passed: true,
				status: formatBytes(sizeBytes),
				description:
					"Message is safely below Gmail's 102 KB clipping threshold.",
			});
		} else {
			list.push({
				title: "Exceeds Gmail 102 KB Limit",
				passed: false,
				status: formatBytes(sizeBytes),
				description:
					"Gmail clips messages larger than 102 KB, hiding content and disabling open tracking pixels.",
			});
		}

		// Plain text version check
		if (email.textBody && email.textBody.trim().length > 0) {
			list.push({
				title: "Plain Text Alternative Included",
				passed: true,
				status: "Included",
				description:
					"A plain text alternative helps accessibility and improves inbox placement.",
			});
		} else {
			list.push({
				title: "Plain Text Alternative Missing",
				passed: false,
				status: "Missing",
				description:
					"Including a text/plain version reduces spam scores on major ESPs.",
			});
		}

		// Reply-friendly check
		const isNoReply = /no[-_]?reply|dont[-_]?reply/i.test(
			email.fromEmail || "",
		);
		if (!isNoReply) {
			list.push({
				title: "Reply-Friendly Sender",
				passed: true,
				status: email.fromEmail,
				description:
					"Using a real sender address encourages positive recipient engagement.",
			});
		} else {
			list.push({
				title: "No-Reply Address Detected",
				passed: false,
				status: "no-reply",
				description:
					"No-reply addresses prevent replies and can reduce delivery reputation.",
			});
		}

		return list;
	}, [email]);

	return (
		<Drawer.Root open={open} onOpenChange={onOpenChange}>
			<Drawer.Content className="w-full max-w-3xl border-stroke-soft-200 bg-bg-white-0 dark:border-stroke-soft-100/40 dark:bg-[#121212]">
				<Drawer.Header className="flex items-center justify-between border-stroke-soft-100 border-b px-6 py-4 dark:border-stroke-soft-100/40">
					<div className="flex min-w-0 items-center gap-3">
						<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-bg-weak-50 text-text-strong-950 dark:bg-white/[0.06]">
							<Icon name="mail-single" className="h-5 w-5" />
						</div>
						<div className="min-w-0">
							<Drawer.Title className="truncate font-semibold text-[15px] text-text-strong-950">
								{isLoading
									? "Loading email..."
									: email?.subject || "(no subject)"}
							</Drawer.Title>
							<p className="truncate text-[12px] text-text-sub-600">
								{email ? (
									<>
										{email.fromEmail} · {formatRelativeTime(email.createdAt)}
									</>
								) : (
									"Email details and delivery breakdown"
								)}
							</p>
						</div>
					</div>
					{email && (
						<div className="flex items-center gap-2">
							<StatusPill status={email.status} />
						</div>
					)}
				</Drawer.Header>

				<Drawer.Body className="space-y-6 overflow-y-auto p-6">
					{isLoading ? (
						<div className="space-y-4 py-8">
							<div className="h-24 animate-pulse rounded-2xl bg-bg-weak-50 dark:bg-white/[0.04]" />
							<div className="h-40 animate-pulse rounded-2xl bg-bg-weak-50 dark:bg-white/[0.04]" />
							<div className="h-64 animate-pulse rounded-2xl bg-bg-weak-50 dark:bg-white/[0.04]" />
						</div>
					) : !email ? (
						<div className="py-12 text-center text-text-sub-600">
							Email details could not be found or loaded.
						</div>
					) : (
						<>
							{/* Error Callout (if failed / error) */}
							{email.errorMessage && (
								<div className="rounded-2xl border border-red-500/20 bg-red-500/[0.06] p-4 text-[13px] dark:bg-red-500/[0.08]">
									<div className="flex items-start gap-3">
										<Icon
											name="alert-circle"
											className="mt-0.5 h-5 w-5 shrink-0 text-red-500"
										/>
										<div className="min-w-0 flex-1">
											<p className="font-semibold text-red-700 dark:text-red-300">
												{errorDiagnostic?.category || "Delivery Error"}
											</p>
											<p className="mt-1 text-[12px] text-red-600/90 dark:text-red-300/80">
												{errorDiagnostic?.summary || email.errorMessage}
											</p>
											<div className="mt-2 break-all rounded-xl bg-black/5 p-2.5 font-mono text-[11px] text-red-800 dark:bg-black/40 dark:text-red-200">
												{email.errorMessage}
											</div>
											{errorDiagnostic?.fixes && (
												<div className="mt-2.5">
													<p className="font-medium text-[11px] text-red-700 dark:text-red-300">
														Suggested steps:
													</p>
													<ul className="mt-1 list-inside list-disc space-y-0.5 text-[11px] text-red-600/90 dark:text-red-300/80">
														{errorDiagnostic.fixes.map((fix) => (
															<li key={fix}>{fix}</li>
														))}
													</ul>
												</div>
											)}
										</div>
									</div>
								</div>
							)}

							{/* Metadata Card */}
							<div className="rounded-2xl border border-stroke-soft-100 bg-bg-weak-50/50 p-4 text-[13px] dark:border-stroke-soft-100/40 dark:bg-white/[0.02]">
								<div className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
									<div className="flex items-start justify-between gap-2">
										<span className="text-text-sub-600">From</span>
										<span className="truncate text-right font-medium text-text-strong-950">
											{email.fromName
												? `${email.fromName} <${email.fromEmail}>`
												: email.fromEmail}
										</span>
									</div>
									<div className="flex items-start justify-between gap-2">
										<span className="text-text-sub-600">To</span>
										<span className="truncate text-right font-medium text-text-strong-950">
											{formatRecipients(email.toEmails)}
										</span>
									</div>
									{Array.isArray(email.ccEmails) &&
									email.ccEmails.length > 0 ? (
										<div className="flex items-start justify-between gap-2">
											<span className="text-text-sub-600">Cc</span>
											<span className="truncate text-right font-medium text-text-strong-950">
												{formatRecipients(email.ccEmails)}
											</span>
										</div>
									) : null}
									{email.replyTo && (
										<div className="flex items-start justify-between gap-2">
											<span className="text-text-sub-600">Reply-To</span>
											<span className="truncate text-right font-medium text-text-strong-950">
												{email.replyTo}
											</span>
										</div>
									)}
									<div className="flex items-start justify-between gap-2">
										<span className="text-text-sub-600">Organization</span>
										<span className="truncate text-right font-medium text-text-strong-950">
											<Link
												href={`/organizations/${email.organizationId}`}
												className="text-primary-base hover:underline"
											>
												{email.organizationName || email.organizationId}
											</Link>
										</span>
									</div>
									<div className="flex items-start justify-between gap-2">
										<span className="text-text-sub-600">Provider</span>
										<span className="text-right font-medium text-text-strong-950 capitalize">
											{email.provider || "postfix"}
										</span>
									</div>
									<div className="flex items-start justify-between gap-2">
										<span className="text-text-sub-600">Size</span>
										<span className="text-right font-medium text-text-strong-950">
											{formatBytes(email.size || email.htmlBody?.length || 0)}
										</span>
									</div>
									<div className="flex items-start justify-between gap-2">
										<span className="text-text-sub-600">Created</span>
										<span className="text-right font-medium text-text-strong-950">
											{formatDateTime(email.createdAt)}
										</span>
									</div>
									{email.sentAt && (
										<div className="flex items-start justify-between gap-2">
											<span className="text-text-sub-600">Sent At</span>
											<span className="text-right font-medium text-text-strong-950">
												{formatDateTime(email.sentAt)}
											</span>
										</div>
									)}
									{email.deliveredAt && (
										<div className="flex items-start justify-between gap-2">
											<span className="text-text-sub-600">Delivered At</span>
											<span className="text-right font-medium text-text-strong-950">
												{formatDateTime(email.deliveredAt)}
											</span>
										</div>
									)}
									{email.failedAt && (
										<div className="flex items-start justify-between gap-2">
											<span className="text-text-sub-600">Failed At</span>
											<span className="text-right font-medium text-red-500 text-text-strong-950">
												{formatDateTime(email.failedAt)}
											</span>
										</div>
									)}
									<div className="flex items-start justify-between gap-2 sm:col-span-2">
										<span className="text-text-sub-600">Message ID</span>
										<div className="flex max-w-[70%] items-center gap-1.5 font-mono text-[11px] text-text-strong-950">
											<span className="truncate">{email.messageId}</span>
											<button
												type="button"
												onClick={() =>
													copyToClipboard(email.messageId, "Message ID")
												}
												className="shrink-0 text-text-sub-600 hover:text-text-strong-950"
												title="Copy Message ID"
											>
												<Icon name="copy" className="h-3 w-3" />
											</button>
										</div>
									</div>
									<div className="flex items-start justify-between gap-2 sm:col-span-2">
										<span className="text-text-sub-600">Email ID</span>
										<div className="flex max-w-[70%] items-center gap-1.5 font-mono text-[11px] text-text-strong-950">
											<span className="truncate">{email.id}</span>
											<button
												type="button"
												onClick={() => copyToClipboard(email.id, "Email ID")}
												className="shrink-0 text-text-sub-600 hover:text-text-strong-950"
												title="Copy Email ID"
											>
												<Icon name="copy" className="h-3 w-3" />
											</button>
										</div>
									</div>
								</div>
							</div>

							{/* Tabs Navigation */}
							<div>
								<div className="flex flex-wrap items-center justify-between gap-2 border-stroke-soft-100 border-b pb-2 dark:border-stroke-soft-100/40">
									<div className="flex flex-wrap gap-1">
										{(
											[
												{ id: "preview", label: "Preview", icon: "eye" },
												{ id: "plain", label: "Plain Text", icon: "file-text" },
												{ id: "html", label: "HTML Source", icon: "code" },
												{ id: "raw", label: "Raw MIME", icon: "file-code" },
												{ id: "headers", label: "Headers", icon: "list" },
												{
													id: "timeline",
													label: `Timeline (${email.events?.length ?? 0})`,
													icon: "history",
												},
												{ id: "insights", label: "Insights", icon: "bulb" },
											] as const
										).map((tab) => (
											<button
												key={tab.id}
												type="button"
												onClick={() => setActiveTab(tab.id)}
												className={cn(
													"flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-medium text-[12px] transition-colors",
													activeTab === tab.id
														? "bg-bg-strong-950 text-bg-white-0 dark:bg-white dark:text-black"
														: "text-text-sub-600 hover:bg-bg-weak-50 hover:text-text-strong-950 dark:hover:bg-white/[0.05]",
												)}
											>
												<Icon name={tab.icon} className="h-3.5 w-3.5" />
												{tab.label}
											</button>
										))}
									</div>

									{activeTab === "preview" && (
										<div className="flex items-center gap-1">
											<button
												type="button"
												onClick={() => setPreviewTheme("light")}
												className={cn(
													"rounded-lg px-2 py-1 font-medium text-[11px] transition-colors",
													previewTheme === "light"
														? "bg-bg-weak-50 font-semibold text-text-strong-950 dark:bg-white/[0.08]"
														: "text-text-sub-600 hover:text-text-strong-950",
												)}
											>
												Light
											</button>
											<button
												type="button"
												onClick={() => setPreviewTheme("dark")}
												className={cn(
													"rounded-lg px-2 py-1 font-medium text-[11px] transition-colors",
													previewTheme === "dark"
														? "bg-bg-weak-50 font-semibold text-text-strong-950 dark:bg-white/[0.08]"
														: "text-text-sub-600 hover:text-text-strong-950",
												)}
											>
												Dark
											</button>
										</div>
									)}
								</div>

								{/* Tab Content */}
								<div className="mt-4">
									{activeTab === "preview" && (
										<div className="overflow-hidden rounded-2xl border border-stroke-soft-100 dark:border-stroke-soft-100/40">
											{email.htmlBody ? (
												<div
													className={cn(
														"min-h-[360px] p-4 transition-colors",
														previewTheme === "dark"
															? "bg-[#181818] text-white"
															: "bg-white text-black",
													)}
												>
													<iframe
														srcDoc={`<!DOCTYPE html><html><head><meta charset="utf-8"/><style>body{font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;margin:0;padding:16px;color:${previewTheme === "dark" ? "#e5e5e5" : "#1a1a1a"};background:${previewTheme === "dark" ? "#181818" : "#ffffff"};word-break:break-word;}img{max-width:100%;height:auto;}</style></head><body>${email.htmlBody}</body></html>`}
														title="Email Preview"
														className="h-[480px] w-full rounded-lg border-0"
														sandbox="allow-popups allow-popups-to-escape-sandbox"
													/>
												</div>
											) : email.textBody ? (
												<pre className="min-h-[200px] whitespace-pre-wrap p-4 font-mono text-[12px]">
													{email.textBody}
												</pre>
											) : (
												<div className="py-12 text-center text-[13px] text-text-sub-600">
													No HTML or text body available for preview.
												</div>
											)}
										</div>
									)}

									{activeTab === "plain" && (
										<div className="relative rounded-2xl border border-stroke-soft-100 bg-bg-weak-50/50 p-4 dark:border-stroke-soft-100/40 dark:bg-white/[0.02]">
											<div className="flex items-center justify-between border-stroke-soft-100 border-b pb-2.5 dark:border-stroke-soft-100/40">
												<span className="font-mono text-[11px] text-text-sub-600">
													text/plain
												</span>
												{email.textBody ? (
													<Button.Root
														size="xsmall"
														variant="neutral"
														mode="stroke"
														onClick={() =>
															copyToClipboard(
																email.textBody || "",
																"Plain text",
															)
														}
													>
														<Icon name="copy" className="h-3 w-3" />
														Copy text
													</Button.Root>
												) : null}
											</div>
											<pre className="mt-3 max-h-[400px] overflow-y-auto whitespace-pre-wrap font-mono text-[12px] text-text-strong-950">
												{email.textBody || "(no plain text body)"}
											</pre>
										</div>
									)}

									{activeTab === "html" && (
										<div className="relative rounded-2xl border border-stroke-soft-100 bg-bg-weak-50/50 p-4 dark:border-stroke-soft-100/40 dark:bg-white/[0.02]">
											<div className="flex items-center justify-between border-stroke-soft-100 border-b pb-2.5 dark:border-stroke-soft-100/40">
												<span className="font-mono text-[11px] text-text-sub-600">
													text/html (formatted)
												</span>
												{email.htmlBody ? (
													<Button.Root
														size="xsmall"
														variant="neutral"
														mode="stroke"
														onClick={() =>
															copyToClipboard(email.htmlBody || "", "HTML code")
														}
													>
														<Icon name="copy" className="h-3 w-3" />
														Copy HTML
													</Button.Root>
												) : null}
											</div>
											<pre className="mt-3 max-h-[420px] overflow-y-auto whitespace-pre-wrap break-all font-mono text-[11px] text-text-strong-950">
												{email.htmlBody
													? formatHtml(email.htmlBody)
													: "(no HTML body)"}
											</pre>
										</div>
									)}

									{activeTab === "raw" && (
										<div className="relative rounded-2xl border border-stroke-soft-100 bg-bg-weak-50/50 p-4 dark:border-stroke-soft-100/40 dark:bg-white/[0.02]">
											<div className="flex items-center justify-between border-stroke-soft-100 border-b pb-2.5 dark:border-stroke-soft-100/40">
												<span className="font-mono text-[11px] text-text-sub-600">
													RFC822 MIME raw message
												</span>
												{email.rawMessage ? (
													<Button.Root
														size="xsmall"
														variant="neutral"
														mode="stroke"
														onClick={() =>
															copyToClipboard(
																email.rawMessage || "",
																"Raw MIME",
															)
														}
													>
														<Icon name="copy" className="h-3 w-3" />
														Copy raw
													</Button.Root>
												) : null}
											</div>
											<pre className="mt-3 max-h-[420px] overflow-y-auto whitespace-pre-wrap break-all font-mono text-[11px] text-text-strong-950">
												{email.rawMessage ||
													"Raw MIME payload is not stored for this message."}
											</pre>
										</div>
									)}

									{activeTab === "headers" && (
										<div className="overflow-hidden rounded-2xl border border-stroke-soft-100 dark:border-stroke-soft-100/40">
											{email.headers &&
											Object.keys(email.headers).length > 0 ? (
												<div className="divide-y divide-stroke-soft-100 dark:divide-stroke-soft-100/40">
													{Object.entries(email.headers).map(([key, val]) => (
														<div
															key={key}
															className="flex items-start justify-between gap-4 p-3 text-[12px]"
														>
															<span className="font-medium font-mono text-text-sub-600">
																{key}
															</span>
															<span className="break-all font-mono text-text-strong-950">
																{val}
															</span>
														</div>
													))}
												</div>
											) : (
												<div className="p-8 text-center text-[13px] text-text-sub-600">
													No custom headers stored with this record.
												</div>
											)}
										</div>
									)}

									{activeTab === "timeline" && (
										<div className="space-y-4 rounded-2xl border border-stroke-soft-100 bg-bg-weak-50/40 p-4 dark:border-stroke-soft-100/40 dark:bg-white/[0.02]">
											<div className="space-y-4">
												{/* Initial Created Event */}
												<div className="flex items-start gap-3">
													<div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
														<Icon name="plus" className="h-3 w-3" />
													</div>
													<div className="min-w-0 flex-1">
														<div className="flex items-center justify-between">
															<p className="font-medium text-[13px] text-text-strong-950">
																Email queued / created
															</p>
															<span className="text-[11px] text-text-sub-600">
																{formatDateTime(email.createdAt)}
															</span>
														</div>
														<p className="text-[12px] text-text-sub-600">
															Message accepted by SMTP gateway
														</p>
													</div>
												</div>

												{/* Events from DB */}
												{email.events?.map((ev) => (
													<div
														key={ev.id}
														className="flex items-start gap-3 border-stroke-soft-100/60 border-t pt-3 dark:border-stroke-soft-100/30"
													>
														<div
															className={cn(
																"mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px]",
																ev.type === "delivered"
																	? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
																	: ev.type === "failed" ||
																			ev.type === "bounced"
																		? "bg-red-500/10 text-red-600 dark:text-red-400"
																		: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
															)}
														>
															<Icon
																name={
																	ev.type === "delivered"
																		? "check"
																		: ev.type === "failed" ||
																				ev.type === "bounced"
																			? "alert-circle"
																			: "history"
																}
																className="h-3 w-3"
															/>
														</div>
														<div className="min-w-0 flex-1">
															<div className="flex items-center justify-between">
																<p className="font-medium text-[13px] text-text-strong-950 capitalize">
																	{ev.type}
																</p>
																<span className="text-[11px] text-text-sub-600">
																	{formatDateTime(ev.createdAt)}
																</span>
															</div>
															{ev.metadata && (
																<pre className="mt-1.5 rounded-lg bg-black/5 p-2 font-mono text-[11px] text-text-sub-600 dark:bg-white/[0.04]">
																	{JSON.stringify(ev.metadata, null, 2)}
																</pre>
															)}
														</div>
													</div>
												))}
											</div>
										</div>
									)}

									{activeTab === "insights" && (
										<div className="space-y-3">
											{insights.map((item) => (
												<div
													key={item.title}
													className="flex items-start gap-3 rounded-2xl border border-stroke-soft-100 bg-bg-weak-50/50 p-4 dark:border-stroke-soft-100/40 dark:bg-white/[0.02]"
												>
													<div
														className={cn(
															"mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
															item.passed
																? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
																: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
														)}
													>
														<Icon
															name={item.passed ? "check" : "alert-triangle"}
															className="h-3.5 w-3.5"
														/>
													</div>
													<div className="min-w-0 flex-1">
														<div className="flex items-center justify-between gap-2">
															<p className="font-medium text-[13px] text-text-strong-950">
																{item.title}
															</p>
															<span
																className={cn(
																	"rounded-md px-2 py-0.5 font-mono text-[11px]",
																	item.passed
																		? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
																		: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
																)}
															>
																{item.status}
															</span>
														</div>
														<p className="mt-1 text-[12px] text-text-sub-600">
															{item.description}
														</p>
													</div>
												</div>
											))}
										</div>
									)}
								</div>
							</div>
						</>
					)}
				</Drawer.Body>

				<Drawer.Footer className="flex items-center justify-between border-stroke-soft-100 border-t px-6 py-4 dark:border-stroke-soft-100/40">
					<Drawer.Close asChild>
						<Button.Root variant="neutral" mode="stroke" size="small">
							Close
						</Button.Root>
					</Drawer.Close>
					{email && (
						<div className="flex items-center gap-2">
							<Button.Root
								variant="neutral"
								mode="stroke"
								size="small"
								onClick={() => copyToClipboard(email.id, "Email ID")}
							>
								<Icon name="copy" className="h-3.5 w-3.5" />
								Copy ID
							</Button.Root>
							<Button.Root asChild variant="primary" size="small">
								<Link href={`/organizations/${email.organizationId}`}>
									Open org hub
								</Link>
							</Button.Root>
						</div>
					)}
				</Drawer.Footer>
			</Drawer.Content>
		</Drawer.Root>
	);
}
