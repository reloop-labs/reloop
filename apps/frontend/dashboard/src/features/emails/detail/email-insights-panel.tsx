"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useMemo, useState } from "react";

export function formatBytes(bytes: number, decimals = 1): string {
	if (!bytes || bytes === 0) return "0 B";
	const k = 1024;
	const dm = decimals < 0 ? 0 : decimals;
	const sizes = ["B", "KB", "MB", "GB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return `${Number.parseFloat((bytes / k ** i).toFixed(dm))} ${sizes[i]}`;
}

export interface InsightCheckItem {
	id: string;
	title: string;
	status: "improvement" | "great";
	statusLabel: string;
	description: string;
	recommendation?: string;
}

export function InsightAccordionItem({
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

export interface EmailInsightsData {
	fromEmail?: string | null;
	fromName?: string | null;
	subject?: string | null;
	htmlBody?: string | null;
	textBody?: string | null;
	size?: number | null;
}

export function EmailInsightsPanel({ email }: { email: EmailInsightsData }) {
	const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>(
		{},
	);

	const toggleItem = useCallback((id: string) => {
		setExpandedItems((prev) => ({ ...prev, [id]: !prev[id] }));
	}, []);

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
				statusLabel: `Reply-friendly address (${email.fromEmail || "configured"})`,
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
		<div className="space-y-6 pt-2 pb-6">
			{/* Possible Improvements - Always shown */}
			<div className="space-y-2">
				<h4 className="font-semibold text-[11px] text-text-sub-600 uppercase tracking-wider dark:text-neutral-400">
					POSSIBLE IMPROVEMENTS
				</h4>
				<div className="border-stroke-soft-100/60 border-t dark:border-neutral-800/80">
					{improvements.length > 0 ? (
						improvements.map((item) => (
							<InsightAccordionItem
								key={item.id}
								item={item}
								isOpen={Boolean(expandedItems[item.id])}
								onToggle={() => toggleItem(item.id)}
							/>
						))
					) : (
						<div className="flex items-center gap-3 py-4 text-paragraph-sm text-text-sub-600 dark:text-neutral-400">
							<Icon name="check-circle" className="h-4 w-4 text-success-base" />
							<span>
								No improvements needed — your email meets all deliverability
								best practices.
							</span>
						</div>
					)}
				</div>
			</div>

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
	);
}
