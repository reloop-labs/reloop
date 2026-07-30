import { cn } from "@reloop/ui/cn";
import { CodeBlock } from "@reloop/ui/code-block";
import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import * as TabMenu from "@reloop/ui/tab-menu-horizontal";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
	type SmtpDetailRow,
	SmtpResponseDrawer,
} from "./smtp-response-drawer";
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
		summary: "Email delivery failed — check technical details below.",
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
		events?: {
			id: string;
			type: string;
			metadata: Record<string, unknown> | null;
			createdAt: string;
		}[];
	};
	isLoading: boolean;
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

function formatHtml(html: string): string {
	if (!html) return "";
	// Clean up by inserting newlines between tags if they aren't there
	const cleanHtml = html.replace(/>\s*</g, ">\n<");
	const lines = cleanHtml.split("\n");
	let indentLevel = 0;
	let formatted = "";
	const tab = "  "; // 2 spaces

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

function IframePreview({ html }: { html: string }) {
	const iframeRef = useRef<HTMLIFrameElement>(null);

	useEffect(() => {
		const iframe = iframeRef.current;
		if (!iframe) return;

		let observer: ResizeObserver | null = null;

		const updateHeight = () => {
			if (iframe.contentWindow) {
				try {
					const doc = iframe.contentWindow.document;

					// Force height: auto on html/body inside the iframe to avoid viewport/height constraints
					if (doc.body) {
						doc.body.style.setProperty("height", "auto", "important");
					}
					if (doc.documentElement) {
						doc.documentElement.style.setProperty(
							"height",
							"auto",
							"important",
						);
					}

					// Read height directly from the body's scrollHeight/offsetHeight.
					// Since html and body have height: auto, they wrap the content, and
					// body.scrollHeight/offsetHeight represents the actual content size
					// without needing to collapse the iframe to 0px.
					const height = Math.max(
						doc.body?.scrollHeight || 0,
						doc.body?.offsetHeight || 0,
					);

					if (height > 0) {
						// Add a tiny buffer (4px) to ensure no scrollbars show due to subpixel rendering or margins
						iframe.style.height = `${height + 4}px`;
					}
				} catch (_e) {
					// Ignore cross-origin issues if any
				}
			}
		};

		const handleLoad = () => {
			if (observer) {
				observer.disconnect();
				observer = null;
			}

			updateHeight();

			if (iframe.contentWindow) {
				try {
					const body = iframe.contentWindow.document.body;
					if (body) {
						observer = new ResizeObserver(() => {
							updateHeight();
						});
						observer.observe(body);
					}
				} catch (_e) {
					// Ignore
				}
			}
		};

		// If the iframe document is already loaded
		if (iframe.contentWindow?.document.readyState === "complete") {
			handleLoad();
		}

		iframe.addEventListener("load", handleLoad);

		return () => {
			iframe.removeEventListener("load", handleLoad);
			if (observer) {
				observer.disconnect();
			}
		};
	}, []);

	return (
		<iframe
			ref={iframeRef}
			srcDoc={html}
			className="w-full overflow-hidden border-none"
			title="Email Preview"
			sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin"
		/>
	);
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

function ErrorDetailsPanel({ errorMessage }: { errorMessage: string }) {
	const [showRaw, setShowRaw] = useState(false);
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
					<button
						type="button"
						onClick={() => setShowRaw((v) => !v)}
						className="flex flex-shrink-0 cursor-pointer items-center gap-1 font-semibold text-text-soft-400 text-xs transition-colors hover:text-text-strong-950"
					>
						<span>{showRaw ? "Hide details" : "Technical details"}</span>
						<motion.div
							animate={{ rotate: showRaw ? 180 : 0 }}
							transition={{ duration: 0.2 }}
							className="flex items-center justify-center"
						>
							<Icon
								name="chevron-down"
								className="h-3 w-3 text-text-soft-400"
							/>
						</motion.div>
					</button>
				</div>

				{/* Expanded details - inside the same container! */}
				<AnimatePresence initial={false}>
					{showRaw && (
						<motion.div
							initial={{ height: 0, opacity: 0 }}
							animate={{ height: "auto", opacity: 1 }}
							exit={{ height: 0, opacity: 0 }}
							transition={{ duration: 0.2, ease: "easeInOut" }}
							className="overflow-hidden"
						>
							<div className="relative border-error-light/20 border-t bg-bg-weak-50/30 p-3.5 dark:bg-bg-weak-50/5">
								<div className="absolute top-3 right-3 z-10">
									<CopyButton value={errorMessage} label="Error details" />
								</div>
								<pre className="overflow-x-auto whitespace-pre-wrap break-all pr-8 text-error-base text-sm leading-relaxed">
									{errorMessage}
								</pre>
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</section>
	);
}

export const EmailDetail = ({ email, isLoading }: EmailDetailProps) => {
	const [activeTab, setActiveTab] = useState<string>("preview");
	const [hoveredIdx, setHoveredIdx] = useState<number | undefined>(undefined);
	const buttonRefs = useRef<HTMLButtonElement[]>([]);
	const [smtpDetail, setSmtpDetail] = useState<SmtpDetailRow | null>(null);
	const [smtpDrawerOpen, setSmtpDrawerOpen] = useState(false);

	const smtpRows = useMemo(
		() => buildSmtpRows(email?.events),
		[email?.events],
	);

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
		// No SMTP payload yet — still open a minimal delivered panel
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

	if (!email && !isLoading) return null;

	const tabItems = isLoading
		? [
				{ title: "Preview", value: "preview", icon: "mail-single" as const },
				{ title: "Plain Text", value: "plain", icon: "file-text" as const },
				{ title: "HTML Source", value: "html", icon: "code" as const },
				{ title: "Raw", value: "raw", icon: "file-code" as const },
			]
		: [
				...(email?.htmlBody
					? [
							{
								title: "Preview",
								value: "preview",
								icon: "mail-single" as const,
							},
							{
								title: "Plain Text",
								value: "plain",
								icon: "file-text" as const,
							},
							{ title: "HTML Source", value: "html", icon: "code" as const },
							{ title: "Raw", value: "raw", icon: "file-code" as const },
						]
					: [
							{
								title: "Plain Text",
								value: "plain",
								icon: "file-text" as const,
							},
							{ title: "Raw", value: "raw", icon: "file-code" as const },
						]),
			];

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
								email?.toEmails.join(", ")
							)}
						</span>
					</div>
					{!isLoading && email?.ccEmails && email.ccEmails.length > 0 && (
						<div className="flex items-start gap-4">
							<span className="w-16 flex-shrink-0 font-medium text-paragraph-sm text-text-sub-600">
								Cc
							</span>
							<span className="font-medium text-paragraph-sm text-text-strong-950">
								{email.ccEmails.join(", ")}
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
								<Skeleton className="h-4 w-96 rounded-md" />
							) : (
								email?.subject
							)}
						</span>
					</div>
				</div>
			</section>
			{!isLoading && email?.errorMessage && (
				<ErrorDetailsPanel errorMessage={email.errorMessage} />
			)}

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

			<SmtpResponseDrawer
				row={smtpDetail}
				open={smtpDrawerOpen}
				onOpenChange={setSmtpDrawerOpen}
			/>

			{/* Content Preview Tabs */}
			<section>
				<TabMenu.Root value={activeTab} onValueChange={setActiveTab}>
					<TabMenu.List className="relative mb-6 h-10 gap-0 border-b! py-0">
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
									"flex cursor-pointer items-center gap-2 px-2.5 py-0! text-sm transition-colors",
									activeTab === item.value
										? "text-text-strong-950"
										: "text-text-sub-600 hover:text-text-strong-950",
								)}
							>
								<Icon name={item.icon} className="h-4 w-4" />
								{item.title}
							</TabMenu.Trigger>
						))}

						<AnimatePresence>
							{rect && activeIndex !== -1 && (
								<motion.div
									className="absolute top-0 left-0 rounded-lg bg-neutral-alpha-10"
									initial={{
										pointerEvents: "none",
										width: rect.width,
										height: rect.height - 20,
										left:
											rect.left -
											(currentTab?.offsetParent?.getBoundingClientRect().left ||
												0),
										top:
											rect.top -
											(currentTab?.offsetParent?.getBoundingClientRect().top ||
												0) +
											10,
										opacity: 0,
									}}
									animate={{
										pointerEvents: "none",
										width: rect.width,
										height: rect.height - 20,
										left:
											rect.left -
											(currentTab?.offsetParent?.getBoundingClientRect().left ||
												0),
										top:
											rect.top -
											(currentTab?.offsetParent?.getBoundingClientRect().top ||
												0) +
											10,
										opacity: 1,
									}}
									exit={{
										pointerEvents: "none",
										opacity: 0,
										width: rect.width,
										height: rect.height - 20,
										left:
											rect.left -
											(currentTab?.offsetParent?.getBoundingClientRect().left ||
												0),
										top:
											rect.top -
											(currentTab?.offsetParent?.getBoundingClientRect().top ||
												0) +
											10,
									}}
									transition={{ duration: 0.14 }}
								/>
							)}
						</AnimatePresence>
					</TabMenu.List>

					<div className="mb-10 overflow-hidden rounded-xl border border-stroke-soft-100 dark:border-stroke-soft-100/50">
						{isLoading ? (
							<div className="p-6">
								<Skeleton className="h-64 w-full rounded-lg" />
							</div>
						) : (
							<>
								<TabMenu.Content value="preview">
									<div className="bg-white p-6">
										{email?.htmlBody && <IframePreview html={email.htmlBody} />}
									</div>
								</TabMenu.Content>

								<TabMenu.Content value="plain">
									<div className="relative">
										<div className="absolute top-4 right-4 z-10">
											{email?.textBody && (
												<CopyButton value={email.textBody} label="Plain Text" />
											)}
										</div>
										<pre className="whitespace-pre-wrap bg-bg-weak-50/50 p-6 font-mono text-sm text-text-strong-950">
											{email?.textBody || "No text content"}
										</pre>
									</div>
								</TabMenu.Content>

								<TabMenu.Content value="html">
									<div className="relative">
										<div className="absolute top-4 right-4 z-10">
											{email?.htmlBody && (
												<CopyButton
													value={email.htmlBody}
													label="HTML Source"
												/>
											)}
										</div>
										<div className="bg-bg-weak-50/50">
											{email?.htmlBody && (
												<CodeBlock
													code={formatHtml(email.htmlBody)}
													lang="html"
												/>
											)}
										</div>
									</div>
								</TabMenu.Content>

								<TabMenu.Content value="raw">
									<div className="relative">
										{email?.rawMessage ? (
											<>
												<div className="absolute top-4 right-4 z-10">
													<CopyButton
														value={email.rawMessage}
														label="Raw message"
													/>
												</div>
												<pre className="max-h-[min(70vh,48rem)] overflow-auto whitespace-pre-wrap break-all bg-bg-weak-50/50 p-6 font-mono text-[12px] text-text-strong-950 leading-relaxed">
													{email.rawMessage}
												</pre>
											</>
										) : (
											<p className="p-6 text-paragraph-sm text-text-sub-600">
												Raw message not available for this send. New messages
												store the full SMTP MIME after delivery preparation.
											</p>
										)}
									</div>
								</TabMenu.Content>
							</>
						)}
					</div>
				</TabMenu.Root>
			</section>

			{/* Headers */}
			{(isLoading ||
				(email?.headers && Object.keys(email.headers).length > 0)) && (
				<section>
					<div className="mb-4 flex items-center justify-between">
						<h3 className="font-medium text-paragraph-sm text-text-strong-950">
							SMTP Headers
						</h3>
						{!isLoading && (
							<CopyButton
								value={JSON.stringify(email?.headers, null, 2)}
								label="Headers"
							/>
						)}
					</div>
					<div className="overflow-auto rounded-xl border border-stroke-soft-100 p-6 dark:border-stroke-soft-100/50">
						{isLoading ? (
							<div className="space-y-2">
								<Skeleton className="h-3 w-3/4 rounded-md" />
								<Skeleton className="h-3 w-1/2 rounded-md" />
								<Skeleton className="h-3 w-5/6 rounded-md" />
							</div>
						) : (
							<pre className="font-mono text-[11px] text-text-sub-600 leading-relaxed">
								{JSON.stringify(email?.headers, null, 2)}
							</pre>
						)}
					</div>
				</section>
			)}
		</div>
	);
};
