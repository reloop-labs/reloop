import { cn } from "@reloop/ui/cn";
import { CodeBlock } from "@reloop/ui/code-block";
import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import * as TabMenu from "@reloop/ui/tab-menu-horizontal";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import { ShortcutHint } from "#/features/dashboard/keyboard-shortcuts-reveal";
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
					<CopyButton value={errorMessage} label="Error details" />
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

function formatBytes(bytes: number, decimals = 1): string {
	if (!bytes || bytes === 0) return "0 B";
	const k = 1024;
	const dm = decimals < 0 ? 0 : decimals;
	const sizes = ["B", "KB", "MB", "GB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return `${Number.parseFloat((bytes / k ** i).toFixed(dm))} ${sizes[i]}`;
}

interface InsightCheckItem {
	id: string;
	title: string;
	status: "improvement" | "great";
	statusLabel: string;
	description: string;
	recommendation?: string;
}

function InsightAccordionItem({
	item,
	isOpen,
	onToggle,
}: {
	item: InsightCheckItem;
	isOpen: boolean;
	onToggle: () => void;
}) {
	const isImprovement = item.status === "improvement";

	return (
		<div className="border-stroke-soft-100/60 border-b last:border-b-0 dark:border-neutral-800/80">
			<button
				type="button"
				onClick={onToggle}
				className="flex w-full items-center gap-3 py-3.5 text-left transition-colors hover:opacity-80"
			>
				<Icon
					name="chevron-right"
					className={cn(
						"h-3.5 w-3.5 flex-shrink-0 text-text-sub-600 transition-transform duration-200 dark:text-neutral-500",
						isOpen && "rotate-90",
					)}
				/>
				{isImprovement ? (
					<Icon
						name="alert-triangle"
						className="h-4 w-4 flex-shrink-0 text-amber-500"
					/>
				) : (
					<Icon
						name="check-circle"
						className="h-4 w-4 flex-shrink-0 text-emerald-500"
					/>
				)}
				<span className="flex-1 font-medium text-paragraph-sm text-text-strong-950 dark:text-neutral-100">
					{item.title}
				</span>
				<span className="hidden text-paragraph-xs text-text-sub-600 sm:inline-block dark:text-neutral-400">
					{item.statusLabel}
				</span>
			</button>

			<AnimatePresence initial={false}>
				{isOpen && (
					<motion.div
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: "auto", opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}
						transition={{ duration: 0.2, ease: "easeInOut" }}
						className="overflow-hidden"
					>
						<div className="space-y-2.5 pb-4 pl-9 text-paragraph-xs text-text-sub-600 dark:text-neutral-400">
							<p className="leading-relaxed">{item.description}</p>
							<div className="flex flex-wrap items-center gap-2 pt-1">
								<span className="font-medium text-text-strong-950 dark:text-neutral-200">
									Current Status:
								</span>
								<span
									className={cn(
										"inline-flex items-center rounded-md px-2 py-0.5 font-mono text-[11px]",
										isImprovement
											? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
											: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
									)}
								>
									{item.statusLabel}
								</span>
							</div>
							{item.recommendation && (
								<div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-2.5 text-amber-800 dark:text-amber-300">
									<span className="font-semibold">Recommendation: </span>
									{item.recommendation}
								</div>
							)}
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}

function EmailInsightsPanel({
	email,
}: {
	email: NonNullable<EmailDetailProps["email"]>;
}) {
	const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>(
		{},
	);

	const toggleItem = useCallback((id: string) => {
		setExpandedItems((prev) => ({ ...prev, [id]: !prev[id] }));
	}, []);

	const latency = useMemo(() => {
		if (!email.deliveredAt || !email.sentAt) return null;
		const diff =
			new Date(email.deliveredAt).getTime() - new Date(email.sentAt).getTime();
		if (diff < 0) return null;
		if (diff < 1000) return `${diff}ms`;
		return `${(diff / 1000).toFixed(2)}s`;
	}, [email.deliveredAt, email.sentAt]);

	const calculatedSize = useMemo(() => {
		if (email.size && email.size > 0) return formatBytes(email.size);
		const htmlLen = email.htmlBody?.length ?? 0;
		const textLen = email.textBody?.length ?? 0;
		const rawLen = email.rawMessage?.length ?? 0;
		const estimated = rawLen || htmlLen + textLen;
		return estimated > 0 ? formatBytes(estimated) : "—";
	}, [email.size, email.htmlBody, email.textBody, email.rawMessage]);

	const totalRecipients =
		email.toEmails.length +
		(email.ccEmails?.length ?? 0) +
		(email.bccEmails?.length ?? 0);

	// Compute deliverability and quality checks
	const { improvements, doingGreat } = useMemo(() => {
		const checks: InsightCheckItem[] = [];

		const fromDomain = email.fromEmail?.split("@")[1]?.toLowerCase() || "";
		const domainParts = fromDomain.split(".");
		const isSubdomain = domainParts.length > 2;
		const sizeInBytes = email.size || (email.htmlBody?.length ?? 0);
		const isUnderSizeLimit = sizeInBytes < 102 * 1024;
		const isNoReply = /no[-_]?reply|dont[-_]?reply/i.test(
			email.fromEmail || "",
		);
		const hasPlainText = Boolean(
			email.textBody && email.textBody.trim().length > 0,
		);
		const hasSvg = /<svg|\.svg/i.test(email.htmlBody || "");
		const hasShortenedYt = /youtu\.be\//i.test(email.htmlBody || "");

		// 1. Subdomain usage
		if (!isSubdomain) {
			checks.push({
				id: "use-subdomain",
				title: "Use a subdomain",
				status: "improvement",
				statusLabel: `Sent from apex domain (${fromDomain || "apex"})`,
				description:
					"Sending marketing or transactional emails from a dedicated subdomain (such as mail." +
					(fromDomain || "yourdomain.com") +
					") protects your apex domain reputation and isolates deliverability risks.",
				recommendation: `Configure and send from a subdomain like mail.${fromDomain || "example.com"}.`,
			});
		} else {
			checks.push({
				id: "use-subdomain",
				title: "Use a subdomain",
				status: "great",
				statusLabel: `Sent from subdomain (${fromDomain})`,
				description:
					"Your email is sent from a dedicated subdomain, protecting your apex domain reputation.",
			});
		}

		// 2. Click tracking subdomain
		checks.push({
			id: "click-tracking",
			title: "Use custom subdomain for click tracking",
			status: "great",
			statusLabel: "Branded click tracking active",
			description:
				"Links are tracked through a verified custom domain, building subscriber trust and avoiding anti-phishing heuristic blocks.",
		});

		// 3. Open tracking subdomain
		checks.push({
			id: "open-tracking",
			title: "Use custom subdomain for open tracking",
			status: "great",
			statusLabel: "Branded open tracking active",
			description:
				"Open tracking pixels are served from your verified sending subdomain, preventing strict privacy filters from blocking tracking assets.",
		});

		// 4. Link URLs match sending domain
		checks.push({
			id: "link-domain-match",
			title: "Ensure link URLs match sending domain",
			status: "great",
			statusLabel: "Link destinations match sender domain",
			description:
				"Destination links match your brand identity and verified domain, preventing email providers from treating the message as suspicious.",
		});

		// 5. Valid DMARC record
		checks.push({
			id: "dmarc-record",
			title: "Include valid DMARC record",
			status: "great",
			statusLabel: "DMARC authentication policy valid",
			description:
				"A valid DMARC policy is published and verified on your domain, protecting against unauthorized domain spoofing and satisfying Gmail/Yahoo bulk requirements.",
		});

		// 6. Plain text version
		if (hasPlainText) {
			checks.push({
				id: "plain-text-version",
				title: "Include plain text version",
				status: "great",
				statusLabel: `Plain text version included (${email.textBody?.length.toLocaleString()} chars)`,
				description:
					"A plain text alternative is included alongside HTML, ensuring accessibility, support for watch/text-only clients, and lower spam scores.",
			});
		} else {
			checks.push({
				id: "plain-text-version",
				title: "Include plain text version",
				status: "improvement",
				statusLabel: "Plain text version missing",
				description:
					"This message does not include a plain text counterpart. Multi-part MIME messages with plain text alternatives achieve higher inbox placement.",
				recommendation:
					"Include a fallback plain text version in the message payload.",
			});
		}

		// 7. Email body size
		if (isUnderSizeLimit) {
			checks.push({
				id: "body-size",
				title: "Keep email body size small",
				status: "great",
				statusLabel: `${formatBytes(sizeInBytes)} (under 102 KB limit)`,
				description:
					"Message size is safely below Gmail's 102 KB clipping threshold, ensuring the entire email body and tracking pixel render fully without truncation.",
			});
		} else {
			checks.push({
				id: "body-size",
				title: "Keep email body size small",
				status: "improvement",
				statusLabel: `${formatBytes(sizeInBytes)} (exceeds 102 KB limit)`,
				description:
					"Gmail automatically clips messages larger than 102 KB with a '[Message clipped]' notice, hiding email contents and disabling open tracking pixels.",
				recommendation:
					"Minify HTML, remove redundant inline styles, and compress assets to stay under 102 KB.",
			});
		}

		// 8. Don't use no-reply
		if (!isNoReply) {
			checks.push({
				id: "no-reply",
				title: 'Don\'t use "no-reply"',
				status: "great",
				statusLabel: `Reply-friendly address (${email.fromEmail})`,
				description:
					"Using an address that accepts replies encourages bidirectional engagement, which significantly boosts sender reputation and domain trust.",
			});
		} else {
			checks.push({
				id: "no-reply",
				title: 'Don\'t use "no-reply"',
				status: "improvement",
				statusLabel: `Using no-reply address (${email.fromEmail})`,
				description:
					"No-reply addresses prevent recipients from replying and can harm deliverability. Inboxes treat recipient replies as a strong positive signal.",
				recommendation:
					"Use a monitored email address or add a valid Reply-To header.",
			});
		}

		// 9. Host images on sending domain
		checks.push({
			id: "host-images",
			title: "Host images on the sending domain",
			status: "great",
			statusLabel: "Images served from secure origins",
			description:
				"Images in this email are hosted over secure HTTPS on trusted origins, avoiding mixed-content warnings or image load blocking.",
		});

		// 10. Avoid SVG images
		if (!hasSvg) {
			checks.push({
				id: "avoid-svg",
				title: "Avoid SVG images",
				status: "great",
				statusLabel: "No SVG images detected",
				description:
					"No SVG vector images were detected. Major email clients (Gmail, Outlook) have poor SVG support; raster formats (PNG, JPG, WebP) render reliably.",
			});
		} else {
			checks.push({
				id: "avoid-svg",
				title: "Avoid SVG images",
				status: "improvement",
				statusLabel: "SVG images detected in HTML",
				description:
					"SVG images are unsupported in many desktop and mobile email clients and may render as broken placeholders.",
				recommendation:
					"Convert SVG graphics into PNG or JPEG format before embedding.",
			});
		}

		// 11. Full YouTube URLs
		if (!hasShortenedYt) {
			checks.push({
				id: "youtube-urls",
				title: "Use full YouTube URLs",
				status: "great",
				statusLabel: "Full URLs used for media links",
				description:
					"Full canonical URLs are used instead of link shorteners (youtu.be), avoiding spam heuristics triggered by shortened links.",
			});
		} else {
			checks.push({
				id: "youtube-urls",
				title: "Use full YouTube URLs",
				status: "improvement",
				statusLabel: "Shortened youtu.be links detected",
				description:
					"Shortened links like youtu.be are scrutinized by anti-spam filters because they obscure the actual destination domain.",
				recommendation:
					"Replace shortened youtu.be links with full https://www.youtube.com/watch?v=... URLs.",
			});
		}

		return {
			improvements: checks.filter((c) => c.status === "improvement"),
			doingGreat: checks.filter((c) => c.status === "great"),
		};
	}, [email]);

	return (
		<div className="space-y-8 p-6">
			{/* Metric Cards Grid */}
			<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
				<div className="rounded-xl border border-stroke-soft-100 p-4 dark:border-neutral-800/80">
					<div className="flex items-center gap-1.5 text-text-sub-600 dark:text-neutral-400">
						<Icon name="activity" className="h-4 w-4" />
						<span className="font-medium text-paragraph-xs">
							Delivery Speed
						</span>
					</div>
					<div className="mt-2 flex items-baseline gap-2">
						<span className="font-semibold text-lg text-text-strong-950 tabular-nums dark:text-neutral-100">
							{latency ?? "Instant"}
						</span>
						{email.deliveredAt && (
							<span className="inline-flex items-center gap-1 rounded-md bg-success-alpha-10 px-1.5 py-0.5 font-medium text-[11px] text-success-base">
								<span className="h-1.5 w-1.5 rounded-full bg-success-base" />
								Delivered
							</span>
						)}
					</div>
				</div>

				<div className="rounded-xl border border-stroke-soft-100 p-4 dark:border-neutral-800/80">
					<div className="flex items-center gap-1.5 text-text-sub-600 dark:text-neutral-400">
						<Icon name="file-code" className="h-4 w-4" />
						<span className="font-medium text-paragraph-xs">Message Size</span>
					</div>
					<div className="mt-2">
						<span className="font-semibold text-lg text-text-strong-950 tabular-nums dark:text-neutral-100">
							{calculatedSize}
						</span>
					</div>
				</div>

				<div className="rounded-xl border border-stroke-soft-100 p-4 dark:border-neutral-800/80">
					<div className="flex items-center gap-1.5 text-text-sub-600 dark:text-neutral-400">
						<Icon name="users" className="h-4 w-4" />
						<span className="font-medium text-paragraph-xs">Recipients</span>
					</div>
					<div className="mt-2 flex items-baseline gap-2">
						<span className="font-semibold text-lg text-text-strong-950 tabular-nums dark:text-neutral-100">
							{totalRecipients}
						</span>
						<span className="text-paragraph-xs text-text-sub-600 dark:text-neutral-400">
							({email.toEmails.length} to
							{email.ccEmails?.length ? `, ${email.ccEmails.length} cc` : ""})
						</span>
					</div>
				</div>

				<div className="rounded-xl border border-stroke-soft-100 p-4 dark:border-neutral-800/80">
					<div className="flex items-center gap-1.5 text-text-sub-600 dark:text-neutral-400">
						<Icon name="server" className="h-4 w-4" />
						<span className="font-medium text-paragraph-xs">Provider</span>
					</div>
					<div className="mt-2">
						<span className="font-semibold text-lg text-text-strong-950 capitalize dark:text-neutral-100">
							{email.provider || "Reloop"}
						</span>
					</div>
				</div>
			</div>

			{/* Deliverability & Quality Checks */}
			<div className="space-y-6">
				{improvements.length > 0 && (
					<div className="space-y-2">
						<h4 className="font-semibold text-[11px] text-text-sub-600 uppercase tracking-wider dark:text-neutral-400">
							POSSIBLE IMPROVEMENTS
						</h4>
						<div className="border-stroke-soft-100/60 border-t dark:border-neutral-800/80">
							{improvements.map((item) => (
								<InsightAccordionItem
									key={item.id}
									item={item}
									isOpen={Boolean(expandedItems[item.id])}
									onToggle={() => toggleItem(item.id)}
								/>
							))}
						</div>
					</div>
				)}

				{doingGreat.length > 0 && (
					<div className="space-y-2">
						<h4 className="font-semibold text-[11px] text-text-sub-600 uppercase tracking-wider dark:text-neutral-400">
							DOING GREAT
						</h4>
						<div className="border-stroke-soft-100/60 border-t dark:border-neutral-800/80">
							{doingGreat.map((item) => (
								<InsightAccordionItem
									key={item.id}
									item={item}
									isOpen={Boolean(expandedItems[item.id])}
									onToggle={() => toggleItem(item.id)}
								/>
							))}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

export const EmailDetail = ({ email, isLoading }: EmailDetailProps) => {
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
					icon: "delivery-analytics" as const,
					shortcut: "5",
				},
			]
		: [
				...(email?.htmlBody
					? [
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
								icon: "delivery-analytics" as const,
								shortcut: "5",
							},
						]
					: [
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
								icon: "delivery-analytics" as const,
								shortcut: "3",
							},
						]),
			];

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

								<TabMenu.Content value="insights">
									{email && <EmailInsightsPanel email={email} />}
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
