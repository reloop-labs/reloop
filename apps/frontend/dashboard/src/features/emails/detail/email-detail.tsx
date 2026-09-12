import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import * as TabMenu from "@reloop/ui/tab-menu-horizontal";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import { MessageAttachments } from "#/features/agent-inbox/components/thread-detail/message-attachments";
import { ShortcutHint } from "#/features/dashboard/keyboard-shortcuts-reveal";
import { CopyCodeBlock } from "#/features/onboarding/step4/copy-code-block";
import { EmailHtmlPreview } from "./email-html-preview";
import { EmailInsightsPanel } from "./email-insights-panel";
import { formatHtml } from "./format-html";
import { type SmtpDetailRow, SmtpResponseDrawer } from "./smtp-response-drawer";
import { EmailTimeline } from "./timeline";

// ─── Error classification ──────────────────────────────────────────────────

interface ErrorClassification {
	category: string;
	summary: string;
	fixes: string[];
}

function classifyError(msg: string): ErrorClassification {
	const m = msg.toLowerCase();

	// SMTP authentication / credential issues
	if (
		m.includes("535") ||
		m.includes("authentication") ||
		m.includes("auth failed") ||
		m.includes("invalid credentials") ||
		m.includes("username") ||
		m.includes("password") ||
		m.includes("unauthorized")
	) {
		return {
			category: "Authentication Failure",
			summary: "SMTP credentials were rejected by the sending server.",
			fixes: [
				"Verify SMTP username & password",
				"Use an App Password (Gmail)",
				"Regenerate API key or credentials",
			],
		};
	}

	// DNS / domain resolution failures
	if (
		m.includes("dns") ||
		m.includes("no mx") ||
		m.includes("no such host") ||
		m.includes("name or service not known") ||
		m.includes("could not resolve") ||
		m.includes("domain not found")
	) {
		return {
			category: "DNS Resolution Error",
			summary: "Recipient domain has no valid MX record or doesn't exist.",
			fixes: [
				"Check recipient address spelling",
				"Verify domain MX records exist",
				"Allow DNS propagation time",
			],
		};
	}

	// Bounce / recipient rejection
	if (
		m.includes("550") ||
		m.includes("551") ||
		m.includes("552") ||
		m.includes("553") ||
		m.includes("bounce") ||
		m.includes("user unknown") ||
		m.includes("no such user") ||
		m.includes("mailbox not found") ||
		m.includes("recipient rejected") ||
		m.includes("does not exist")
	) {
		return {
			category: "Mailbox Rejected",
			summary: "Receiving server rejected the address — inbox may not exist.",
			fixes: [
				"Confirm recipient address is valid",
				"Add SPF & DKIM to your domain",
				"Check IP blocklists (MXToolbox)",
			],
		};
	}

	// Spam / policy block
	if (
		m.includes("spam") ||
		m.includes("blocked") ||
		m.includes("policy") ||
		m.includes("abuse") ||
		m.includes("blacklist") ||
		m.includes("dnsbl") ||
		m.includes("content rejected")
	) {
		return {
			category: "Spam / Policy Block",
			summary:
				"A spam filter or policy on the receiving server blocked delivery.",
			fixes: [
				"Remove IP from blocklists",
				"Configure SPF, DKIM & DMARC",
				"Clean your mailing list",
			],
		};
	}

	// Rate limiting / throttling
	if (
		m.includes("rate limit") ||
		m.includes("too many") ||
		m.includes("throttle") ||
		m.includes("quota") ||
		m.includes("limit exceeded") ||
		m.includes("421") ||
		m.includes("452")
	) {
		return {
			category: "Rate Limit Exceeded",
			summary:
				"Sending quota was exceeded on your provider or the recipient server.",
			fixes: [
				"Reduce sending frequency",
				"Upgrade your sending plan",
				"Add retry with back-off",
			],
		};
	}

	// TLS / connection security
	if (
		m.includes("tls") ||
		m.includes("ssl") ||
		m.includes("certificate") ||
		m.includes("handshake") ||
		m.includes("secure connection") ||
		m.includes("starttls")
	) {
		return {
			category: "TLS Handshake Error",
			summary: "TLS/SSL negotiation failed — likely a cert or port mismatch.",
			fixes: [
				"Use port 587 (STARTTLS) or 465 (SSL)",
				"Renew expired SSL certificate",
				"Require TLS 1.2+",
			],
		};
	}

	// Connection / timeout
	if (
		m.includes("timeout") ||
		m.includes("connection refused") ||
		m.includes("could not connect") ||
		m.includes("network") ||
		m.includes("unreachable") ||
		m.includes("connection reset")
	) {
		return {
			category: "Connection Error",
			summary: "Could not connect to the mail server — firewall or wrong host.",
			fixes: [
				"Check SMTP host & port config",
				"Allow SMTP egress in firewall",
				"Check provider status page",
			],
		};
	}

	if (
		m.includes("enoent") ||
		m.includes("no such file") ||
		m.includes("could not be loaded") ||
		m.includes("attachment could not")
	) {
		return {
			category: "Missing Attachment",
			summary: "The attached file could not be found when sending.",
			fixes: [
				"Remove the file and upload it again",
				"Wait until the upload finishes, then send",
				"Send without the attachment if the file is no longer needed",
			],
		};
	}

	// Attachment / size
	if (
		m.includes("message too large") ||
		m.includes("size limit") ||
		m.includes("attachment") ||
		m.includes("552") ||
		m.includes("file too big")
	) {
		return {
			category: "Message Too Large",
			summary: "Email exceeds the size limit set by the receiving server.",
			fixes: [
				"Remove or compress attachments",
				"Link to files instead of attaching",
				"Check provider size limits",
			],
		};
	}

	// Generic fallback
	return {
		category: "Delivery Error",
		summary: "Email delivery failed.",
		fixes: [
			"Verify SMTP host, port & credentials",
			"Confirm recipient address is valid",
			"Contact your email provider support",
		],
	};
}

interface EmailDetailProps {
	email?: {
		id: string;
		status?: string;
		fromEmail: string;
		fromName: string | null;
		toEmails: string[];
		ccEmails: string[] | null;
		bccEmails: string[] | null;
		subject: string;
		textBody: string | null;
		htmlBody: string | null;
		rawMessage?: string | null;
		errorMessage: string | null;
		provider: string;
		size: number;
		headers: Record<string, string> | null;
		sentAt: string | null;
		deliveredAt: string | null;
		failedAt?: string | null;
		createdAt: string;
		updatedAt?: string;
		attachments?: Array<{
			id: string;
			filename: string;
			contentType: string;
			size: number;
			storagePath: string;
			contentDisposition?: string | null;
			contentId?: string | null;
		}>;
		events?: {
			id: string;
			type: string;
			metadata: Record<string, unknown> | null;
			createdAt: string;
		}[];
	};
	isLoading: boolean;
	onResend?: () => void;
	isResending?: boolean;
}

const SMTP_EVENT_TYPES = new Set([
	"sent",
	"delivered",
	"bounced",
	"deferred",
	"complaint",
	"failed",
]);

function buildSmtpRows(
	events: NonNullable<EmailDetailProps["email"]>["events"],
): SmtpDetailRow[] {
	return (events || [])
		.filter((e) => SMTP_EVENT_TYPES.has(e.type))
		.map((e) => {
			const meta = (e.metadata || {}) as {
				kumoType?: string;
				recipient?: string;
				response?: {
					code?: number | null;
					content?: string | null;
				} | null;
				bounceClassification?: string | null;
			};
			const code = meta.response?.code;
			const content = meta.response?.content;
			if (code == null && !content) return null;
			return {
				id: e.id,
				type: e.type,
				kumoType: meta.kumoType || e.type,
				recipient: meta.recipient,
				code,
				content,
				classification: meta.bounceClassification,
				createdAt: e.createdAt,
			} satisfies SmtpDetailRow;
		})
		.filter(Boolean) as SmtpDetailRow[];
}

/** Prefer Delivery/delivered rows for the timeline Delivered step. */
function pickDeliveredSmtpRow(rows: SmtpDetailRow[]): SmtpDetailRow | null {
	const byKumo = rows.find((r) => r.kumoType.toLowerCase() === "delivery");
	if (byKumo) return byKumo;
	const byType = rows.find((r) => r.type === "delivered");
	if (byType) return byType;
	// Fall back to last successful 2xx response
	const success = [...rows]
		.reverse()
		.find((r) => r.code != null && r.code >= 200 && r.code < 300);
	return success ?? rows[rows.length - 1] ?? null;
}

function CopyButton({ value, label }: { value: string; label?: string }) {
	const [copied, setCopied] = useState(false);

	const handleCopy = useCallback(async () => {
		try {
			await navigator.clipboard.writeText(value);
			setCopied(true);
			toast.success(label ? `${label} copied` : "Copied");
			setTimeout(() => setCopied(false), 2000);
		} catch {
			toast.error("Failed to copy");
		}
	}, [value, label]);

	return (
		<button
			type="button"
			onClick={handleCopy}
			className="rounded p-1 text-text-soft-400 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950"
			title={`Copy ${label || "value"}`}
		>
			<Icon
				name={copied ? "check" : "copy"}
				className={cn("h-3 w-3", copied && "text-success-base")}
			/>
		</button>
	);
}

function ErrorDetailsPanel({
	errorMessage,
	onResend,
	isResending,
}: {
	errorMessage: string;
	onResend?: () => void;
	isResending?: boolean;
}) {
	const { summary } = classifyError(errorMessage);

	return (
		<section>
			<div className="overflow-hidden rounded-2xl border border-error-light/40 bg-error-lighter/30 dark:bg-error-lighter/10">
				{/* Top row */}
				<div className="flex items-center justify-between gap-3 px-3.5 py-2.5 text-paragraph-sm">
					<div className="flex min-w-0 items-center gap-2.5">
						<Icon
							name="cross-circle"
							className="h-4 w-4 flex-shrink-0 text-error-base"
						/>
						<span className="flex-shrink-0 font-semibold text-error-base">
							Delivery Failed
						</span>
						<span className="flex-shrink-0 text-stroke-sub-300 dark:text-stroke-sub-300/40">
							|
						</span>
						<span className="truncate font-medium text-text-sub-600">
							{summary}
						</span>
					</div>
					{onResend && (
						<div className="flex items-center gap-2">
							<Button.Root
								size="xsmall"
								variant="neutral"
								mode="stroke"
								disabled={isResending}
								onClick={onResend}
								className="h-7 shrink-0 gap-1.5 rounded-lg px-2.5 font-medium text-[12px]"
							>
								<Icon
									name={isResending ? "loader-2" : "send-2"}
									className={cn(
										"h-3.5 w-3.5 shrink-0",
										isResending && "animate-spin",
									)}
								/>
								<span>{isResending ? "Resending…" : "Resend email"}</span>
							</Button.Root>
						</div>
					)}
				</div>

				{/* Error details content - always visible */}
				<div className="relative border-error-light/20 border-t bg-bg-weak-50/30 p-3.5 dark:bg-bg-weak-50/5">
					<pre className="overflow-x-auto whitespace-pre-wrap break-all font-mono text-error-base text-xs leading-relaxed">
						{errorMessage}
					</pre>
				</div>
			</div>
		</section>
	);
}

export const EmailDetail = ({
	email,
	isLoading,
	onResend,
	isResending,
}: EmailDetailProps) => {
	const [activeTab, setActiveTab] = useState<string>("preview");
	const [hoveredIdx, setHoveredIdx] = useState<number | undefined>(undefined);
	const buttonRefs = useRef<HTMLButtonElement[]>([]);
	const [smtpDetail, setSmtpDetail] = useState<SmtpDetailRow | null>(null);
	const [smtpDrawerOpen, setSmtpDrawerOpen] = useState(false);

	const smtpRows = useMemo(() => buildSmtpRows(email?.events), [email?.events]);

	const openSmtpDetail = useCallback((row: SmtpDetailRow) => {
		setSmtpDetail(row);
		setSmtpDrawerOpen(true);
	}, []);

	const openDeliveredDetail = useCallback(() => {
		const row = pickDeliveredSmtpRow(smtpRows);
		if (row) {
			openSmtpDetail(row);
			return;
		}
		if (email?.deliveredAt) {
			openSmtpDetail({
				id: "delivered-summary",
				type: "delivered",
				kumoType: "Delivery",
				content: null,
				code: 250,
				createdAt: email.deliveredAt,
			});
		}
	}, [email?.deliveredAt, openSmtpDetail, smtpRows]);

	useEffect(() => {
		if (email) {
			setActiveTab(email.htmlBody ? "preview" : "plain");
		}
	}, [email]);

	const tabItems = useMemo(() => {
		if (email && !email.htmlBody) {
			return [
				{
					title: "Plain Text",
					value: "plain",
					icon: "file-text" as const,
					shortcut: "1",
				},
				{
					title: "Raw",
					value: "raw",
					icon: "file-code" as const,
					shortcut: "2",
				},
				{
					title: "Insights",
					value: "insights",
					icon: "bulb" as const,
					shortcut: "3",
				},
			];
		}
		return [
			{
				title: "Preview",
				value: "preview",
				icon: "mail-single" as const,
				shortcut: "1",
			},
			{
				title: "Plain Text",
				value: "plain",
				icon: "file-text" as const,
				shortcut: "2",
			},
			{
				title: "HTML Source",
				value: "html",
				icon: "code" as const,
				shortcut: "3",
			},
			{
				title: "Raw",
				value: "raw",
				icon: "file-code" as const,
				shortcut: "4",
			},
			{
				title: "Insights",
				value: "insights",
				icon: "bulb" as const,
				shortcut: "5",
			},
		];
	}, [email]);

	useHotkeys(
		"1",
		(e) => {
			e.preventDefault();
			const target = tabItems[0]?.value;
			if (target) setActiveTab(target);
		},
		{ enableOnFormTags: false, preventDefault: true },
		[tabItems],
	);

	useHotkeys(
		"2",
		(e) => {
			e.preventDefault();
			const target = tabItems[1]?.value;
			if (target) setActiveTab(target);
		},
		{ enableOnFormTags: false, preventDefault: true },
		[tabItems],
	);

	useHotkeys(
		"3",
		(e) => {
			e.preventDefault();
			const target = tabItems[2]?.value;
			if (target) setActiveTab(target);
		},
		{ enableOnFormTags: false, preventDefault: true },
		[tabItems],
	);

	useHotkeys(
		"4",
		(e) => {
			e.preventDefault();
			const target = tabItems[3]?.value;
			if (target) setActiveTab(target);
		},
		{ enableOnFormTags: false, preventDefault: true },
		[tabItems],
	);

	useHotkeys(
		"5",
		(e) => {
			e.preventDefault();
			const target = tabItems[4]?.value;
			if (target) setActiveTab(target);
		},
		{ enableOnFormTags: false, preventDefault: true },
		[tabItems],
	);

	const activeIndex = tabItems.findIndex((item) => item.value === activeTab);
	const currentIdx = hoveredIdx !== undefined ? hoveredIdx : activeIndex;
	const currentTab = buttonRefs.current[currentIdx];
	const rect = currentTab?.getBoundingClientRect();

	return (
		<div className="space-y-6">
			{/* Delivery Info - Email Header Style */}
			<section>
				<div className="flex flex-col gap-3.5">
					<div className="flex items-start gap-4">
						<span className="w-16 flex-shrink-0 font-medium text-paragraph-sm text-text-sub-600">
							From
						</span>
						<span className="font-medium text-paragraph-sm text-text-strong-950">
							{isLoading ? (
								<Skeleton className="h-4 w-64 rounded-md" />
							) : email?.fromName ? (
								`${email.fromName} <${email.fromEmail}>`
							) : (
								email?.fromEmail
							)}
						</span>
					</div>
					<div className="flex items-start gap-4">
						<span className="w-16 flex-shrink-0 font-medium text-paragraph-sm text-text-sub-600">
							To
						</span>
						<span className="font-medium text-paragraph-sm text-text-strong-950">
							{isLoading ? (
								<Skeleton className="h-4 w-48 rounded-md" />
							) : (
								email?.toEmails?.map((toEmail, idx) => (
									<span key={toEmail}>
										{idx > 0 && ", "}
										<Link
											href={`/contacts/detail/${encodeURIComponent(toEmail)}`}
											className="underline decoration-dotted underline-offset-2 transition-colors hover:text-[#1868DF] dark:hover:text-blue-400"
										>
											{toEmail}
										</Link>
									</span>
								))
							)}
						</span>
					</div>
					{!isLoading && email?.ccEmails && email.ccEmails.length > 0 && (
						<div className="flex items-start gap-4">
							<span className="w-16 flex-shrink-0 font-medium text-paragraph-sm text-text-sub-600">
								Cc
							</span>
							<span className="font-medium text-paragraph-sm text-text-strong-950">
								{email.ccEmails.map((ccEmail, idx) => (
									<span key={ccEmail}>
										{idx > 0 && ", "}
										<Link
											href={`/contacts/detail/${encodeURIComponent(ccEmail)}`}
											className="underline decoration-dotted underline-offset-2 transition-colors hover:text-[#1868DF] dark:hover:text-blue-400"
										>
											{ccEmail}
										</Link>
									</span>
								))}
							</span>
						</div>
					)}
					<div className="flex items-start gap-4">
						<span className="w-16 flex-shrink-0 font-medium text-paragraph-sm text-text-sub-600">
							Date
						</span>
						<span className="font-medium text-paragraph-sm text-text-strong-950">
							{isLoading ? (
								<Skeleton className="h-4 w-40 rounded-md" />
							) : (
								email &&
								new Date(email.createdAt).toLocaleString(undefined, {
									weekday: "long",
									year: "numeric",
									month: "long",
									day: "numeric",
									hour: "2-digit",
									minute: "2-digit",
								})
							)}
						</span>
					</div>
					<div className="flex items-start gap-4">
						<span className="w-16 flex-shrink-0 font-medium text-paragraph-sm text-text-sub-600">
							Subject
						</span>
						<span className="font-medium text-paragraph-sm text-text-strong-950">
							{isLoading ? (
								<Skeleton className="h-4 w-80 rounded-md" />
							) : (
								email?.subject
							)}
						</span>
					</div>
					{!isLoading &&
						email?.attachments &&
						email.attachments.filter((a) => a.contentDisposition !== "inline")
							.length > 0 && (
							<div className="flex items-start gap-4">
								<span className="w-16 flex-shrink-0 pt-0.5 font-medium text-paragraph-sm text-text-sub-600">
									Files
								</span>
								<div className="min-w-0 flex-1">
									<MessageAttachments
										attachments={email.attachments
											.filter((a) => a.contentDisposition !== "inline")
											.map((a) => ({
												id: a.id,
												name: a.filename,
												size:
													a.size > 0 ? `${(a.size / 1024).toFixed(1)} KB` : "",
												contentType: a.contentType,
												storagePath: a.storagePath,
												messageId: email.id,
											}))}
										messageId={email.id}
									/>
								</div>
							</div>
						)}
				</div>
			</section>

			{/* Event Tracking Timeline */}
			<section>
				<EmailTimeline
					events={email?.events || []}
					sentAt={email?.sentAt || email?.createdAt}
					deliveredAt={email?.deliveredAt}
					failedAt={email?.failedAt}
					errorMessage={email?.errorMessage}
					isLoading={isLoading}
					onDeliveredClick={
						!isLoading && email?.deliveredAt ? openDeliveredDetail : undefined
					}
				/>
			</section>

			{!isLoading && email?.errorMessage && (
				<ErrorDetailsPanel
					errorMessage={email.errorMessage}
					onResend={
						email?.status?.toLowerCase() !== "bounced" ? onResend : undefined
					}
					isResending={isResending}
				/>
			)}

			<SmtpResponseDrawer
				row={smtpDetail}
				open={smtpDrawerOpen}
				onOpenChange={setSmtpDrawerOpen}
			/>

			{/* Content Preview Tabs */}
			<section>
				<TabMenu.Root value={activeTab} onValueChange={setActiveTab}>
					<TabMenu.List className="relative mb-6 h-11 gap-0 border-b! py-0">
						{tabItems.map((item, index) => (
							<TabMenu.Trigger
								key={item.value}
								value={item.value}
								ref={(el) => {
									if (el) buttonRefs.current[index] = el;
								}}
								onPointerEnter={() => setHoveredIdx(index)}
								onPointerLeave={() => setHoveredIdx(undefined)}
								className={cn(
									"flex cursor-pointer items-center gap-2 px-3 py-0! font-medium text-sm",
									hoveredIdx === undefined &&
										activeIndex === index &&
										"text-text-strong-950",
								)}
							>
								<Icon name={item.icon} className="h-4 w-4" />
								{item.title}
								<ShortcutHint>{item.shortcut}</ShortcutHint>
							</TabMenu.Trigger>
						))}

						<AnimatePresence>
							{rect && activeIndex !== -1 ? (
								<motion.div
									className="absolute top-0 left-0 rounded-xl bg-neutral-alpha-10"
									initial={{
										pointerEvents: "none",
										width: rect.width,
										height: rect.height - 14,
										left:
											rect.left -
											(currentTab?.offsetParent?.getBoundingClientRect().left ||
												0),
										top:
											rect.top -
											(currentTab?.offsetParent?.getBoundingClientRect().top ||
												0) +
											7,
										opacity: 0,
									}}
									animate={{
										pointerEvents: "none",
										width: rect.width,
										height: rect.height - 14,
										left:
											rect.left -
											(currentTab?.offsetParent?.getBoundingClientRect().left ||
												0),
										top:
											rect.top -
											(currentTab?.offsetParent?.getBoundingClientRect().top ||
												0) +
											7,
										opacity: 1,
									}}
									exit={{ opacity: 0 }}
									transition={{ duration: 0.14 }}
								/>
							) : null}
						</AnimatePresence>
					</TabMenu.List>

					<div
						className={cn(
							"mb-10",
							activeTab === "preview" &&
								"overflow-hidden rounded-xl border border-stroke-soft-100 dark:border-stroke-soft-100/50",
						)}
					>
						{isLoading ? (
							<div className="p-6">
								<Skeleton className="h-64 w-full rounded-lg" />
							</div>
						) : (
							<>
								<TabMenu.Content value="preview">
									<div className="bg-white p-6 dark:bg-neutral-950">
										{email?.htmlBody && (
											<EmailHtmlPreview html={email.htmlBody} />
										)}
									</div>
								</TabMenu.Content>

								<TabMenu.Content value="plain">
									{email?.textBody ? (
										<CopyCodeBlock
											code={email.textBody}
											lang="text"
											label="Plain Text"
										/>
									) : (
										<div className="p-6 text-paragraph-sm text-text-sub-600">
											No text content
										</div>
									)}
								</TabMenu.Content>

								<TabMenu.Content value="html">
									{email?.htmlBody ? (
										<CopyCodeBlock
											code={formatHtml(email.htmlBody)}
											lang="html"
											label="HTML Source"
										/>
									) : (
										<div className="p-6 text-paragraph-sm text-text-sub-600">
											No HTML content available
										</div>
									)}
								</TabMenu.Content>

								<TabMenu.Content value="raw">
									{email?.rawMessage ? (
										<CopyCodeBlock
											code={email.rawMessage}
											lang="text"
											label="Raw message"
										/>
									) : (
										<p className="p-6 text-paragraph-sm text-text-sub-600">
											Raw message not available for this send. New messages
											store the full SMTP MIME after delivery preparation.
										</p>
									)}
								</TabMenu.Content>

								<TabMenu.Content value="insights">
									{email && <EmailInsightsPanel email={email} />}
								</TabMenu.Content>
							</>
						)}
					</div>
				</TabMenu.Root>
			</section>

			{/* Headers */}
			{!isLoading &&
				email?.headers &&
				Object.keys(email.headers).length > 0 && (
					<section>
						<div className="mb-4 flex items-center justify-between">
							<h3 className="font-medium text-paragraph-sm text-text-strong-950">
								SMTP Headers
							</h3>
							<CopyButton
								value={JSON.stringify(email.headers, null, 2)}
								label="Headers"
							/>
						</div>
						<div className="overflow-auto rounded-xl border border-stroke-soft-100 p-6 dark:border-stroke-soft-100/50">
							<pre className="font-mono text-[11px] text-text-sub-600 leading-relaxed">
								{JSON.stringify(email.headers, null, 2)}
							</pre>
						</div>
					</section>
				)}
		</div>
	);
};
