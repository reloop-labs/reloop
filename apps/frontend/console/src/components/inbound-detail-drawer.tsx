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
import { useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";

type InboundAttachment = {
	id: string;
	filename: string;
	contentType: string;
	size: number;
	contentDisposition: string | null;
	contentId: string | null;
};

export type InboundDetailData = {
	id: string;
	mailboxId: string;
	mailboxEmail: string | null;
	mailboxDisplayName: string | null;
	organizationId: string;
	organizationName: string | null;
	fromEmail: string;
	fromName: string | null;
	toEmails: string[] | unknown;
	ccEmails?: string[] | unknown;
	replyTo: string | null;
	subject: string;
	textBody: string | null;
	htmlBody: string | null;
	rawMessage?: string | null;
	size: number;
	status: string;
	isSpam: boolean;
	spamScore: number | null;
	messageId: string | null;
	headers: Record<string, string> | null;
	date: string | Date | null;
	createdAt: string | Date;
	attachments: InboundAttachment[];
};

function formatBytes(bytes: number): string {
	if (bytes === 0) return "0 B";
	const k = 1024;
	const sizes = ["B", "KB", "MB", "GB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return `${Number.parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`;
}

export function InboundDetailDrawer({
	emailId,
	open,
	onOpenChange,
}: {
	emailId: string | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const [activeTab, setActiveTab] = useState<
		"preview" | "plain" | "html" | "raw" | "headers" | "attachments"
	>("preview");

	const { data: email, isLoading } = useSWR<InboundDetailData>(
		open && emailId ? `/inbound/${emailId}` : null,
		() => adminGet<InboundDetailData>(`/inbound/${emailId}`),
	);

	const copyToClipboard = (text: string, label: string) => {
		navigator.clipboard.writeText(text);
		toast.success(`${label} copied to clipboard`);
	};

	return (
		<Drawer.Root open={open} onOpenChange={onOpenChange}>
			<Drawer.Content className="w-full max-w-3xl border-stroke-soft-200 bg-bg-white-0 dark:border-stroke-soft-100/40 dark:bg-[#121212]">
				<Drawer.Header className="flex items-center justify-between border-stroke-soft-100 border-b px-6 py-4 dark:border-stroke-soft-100/40">
					<div className="flex min-w-0 items-center gap-3">
						<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-bg-weak-50 text-text-strong-950 dark:bg-white/[0.06]">
							<Icon name="mail-receive" className="h-5 w-5" />
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
									"Inbound message details"
								)}
							</p>
						</div>
					</div>
					{email ? (
						<div className="flex items-center gap-2">
							<StatusPill status={email.status} />
							{email.isSpam ? <StatusPill status="spam" /> : null}
						</div>
					) : null}
				</Drawer.Header>

				<Drawer.Body className="space-y-6 overflow-y-auto p-6">
					{isLoading ? (
						<div className="space-y-4 py-8">
							<div className="h-24 animate-pulse rounded-2xl bg-bg-weak-50 dark:bg-white/[0.04]" />
							<div className="h-64 animate-pulse rounded-2xl bg-bg-weak-50 dark:bg-white/[0.04]" />
						</div>
					) : !email ? (
						<div className="py-12 text-center text-text-sub-600">
							Inbound email could not be found or loaded.
						</div>
					) : (
						<>
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
									<div className="flex items-start justify-between gap-2">
										<span className="text-text-sub-600">Mailbox</span>
										<span className="truncate text-right font-medium text-text-strong-950">
											{email.mailboxEmail || "—"}
										</span>
									</div>
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
										<span className="text-text-sub-600">Spam score</span>
										<span className="text-right font-medium text-text-strong-950">
											{email.spamScore == null
												? "—"
												: email.spamScore.toFixed(2)}
										</span>
									</div>
									<div className="flex items-start justify-between gap-2">
										<span className="text-text-sub-600">Size</span>
										<span className="text-right font-medium text-text-strong-950">
											{formatBytes(email.size || 0)}
										</span>
									</div>
									<div className="flex items-start justify-between gap-2">
										<span className="text-text-sub-600">Received</span>
										<span className="text-right font-medium text-text-strong-950">
											{formatDateTime(email.createdAt)}
										</span>
									</div>
									{email.replyTo ? (
										<div className="flex items-start justify-between gap-2">
											<span className="text-text-sub-600">Reply-To</span>
											<span className="truncate text-right font-medium text-text-strong-950">
												{email.replyTo}
											</span>
										</div>
									) : null}
									<div className="flex items-start justify-between gap-2 sm:col-span-2">
										<span className="text-text-sub-600">Message ID</span>
										<div className="flex max-w-[70%] items-center gap-1.5 font-mono text-[11px] text-text-strong-950">
											<span className="truncate">{email.messageId || "—"}</span>
											{email.messageId ? (
												<button
													type="button"
													onClick={() =>
														copyToClipboard(email.messageId || "", "Message ID")
													}
													className="shrink-0 text-text-sub-600 hover:text-text-strong-950"
													title="Copy Message ID"
												>
													<Icon name="copy" className="h-3 w-3" />
												</button>
											) : null}
										</div>
									</div>
								</div>
							</div>

							<div>
								<div className="flex flex-wrap gap-1 border-stroke-soft-100 border-b pb-2 dark:border-stroke-soft-100/40">
									{(
										[
											{ id: "preview", label: "Preview", icon: "eye" },
											{ id: "plain", label: "Plain Text", icon: "file-text" },
											{ id: "html", label: "HTML Source", icon: "code" },
											{ id: "raw", label: "Raw MIME", icon: "file-code" },
											{ id: "headers", label: "Headers", icon: "list" },
											{
												id: "attachments",
												label: `Files (${email.attachments.length})`,
												icon: "paperclip",
											},
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

								<div className="mt-4">
									{activeTab === "preview" ? (
										<div className="overflow-hidden rounded-2xl border border-stroke-soft-100 dark:border-stroke-soft-100/40">
											{email.htmlBody ? (
												<iframe
													srcDoc={`<!DOCTYPE html><html><head><meta charset="utf-8"/><style>body{font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;margin:0;padding:16px;word-break:break-word;}img{max-width:100%;height:auto;}</style></head><body>${email.htmlBody}</body></html>`}
													title="Inbound email preview"
													className="h-[480px] w-full rounded-lg border-0 bg-white"
													sandbox="allow-popups allow-popups-to-escape-sandbox"
												/>
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
									) : null}

									{activeTab === "plain" ? (
										<pre className="max-h-[420px] overflow-y-auto whitespace-pre-wrap rounded-2xl border border-stroke-soft-100 p-4 font-mono text-[12px] dark:border-stroke-soft-100/40">
											{email.textBody || "(no plain text body)"}
										</pre>
									) : null}

									{activeTab === "html" ? (
										<pre className="max-h-[420px] overflow-y-auto whitespace-pre-wrap break-all rounded-2xl border border-stroke-soft-100 p-4 font-mono text-[11px] dark:border-stroke-soft-100/40">
											{email.htmlBody || "(no HTML body)"}
										</pre>
									) : null}

									{activeTab === "raw" ? (
										<pre className="max-h-[420px] overflow-y-auto whitespace-pre-wrap break-all rounded-2xl border border-stroke-soft-100 p-4 font-mono text-[11px] dark:border-stroke-soft-100/40">
											{email.rawMessage ||
												"Raw MIME payload is not stored for this message."}
										</pre>
									) : null}

									{activeTab === "headers" ? (
										<div className="overflow-hidden rounded-2xl border border-stroke-soft-100 dark:border-stroke-soft-100/40">
											{email.headers && Object.keys(email.headers).length > 0 ? (
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
									) : null}

									{activeTab === "attachments" ? (
										email.attachments.length > 0 ? (
											<ul className="divide-y divide-stroke-soft-100 overflow-hidden rounded-2xl border border-stroke-soft-100 dark:divide-stroke-soft-100/40 dark:border-stroke-soft-100/40">
												{email.attachments.map((att) => (
													<li
														key={att.id}
														className="flex items-center justify-between gap-3 px-4 py-3 text-[13px]"
													>
														<div className="min-w-0">
															<p className="truncate font-medium text-text-strong-950">
																{att.filename}
															</p>
															<p className="text-[12px] text-text-sub-600">
																{att.contentType} · {formatBytes(att.size)}
															</p>
														</div>
													</li>
												))}
											</ul>
										) : (
											<div className="p-8 text-center text-[13px] text-text-sub-600">
												No attachments on this message.
											</div>
										)
									) : null}
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
					{email ? (
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
					) : null}
				</Drawer.Footer>
			</Drawer.Content>
		</Drawer.Root>
	);
}
