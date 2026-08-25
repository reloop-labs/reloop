import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { useState } from "react";
import { toast } from "sonner";

interface ErrorClassification {
	category: string;
	summary: string;
	fixes: string[];
}

function classifyError(raw: string): ErrorClassification {
	const m = (raw || "").toLowerCase();

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
				"Regenerate API key or mail credentials",
				"Ensure the sending domain is verified",
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
			summary: "Recipient domain has no valid MX record or does not exist.",
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
		m.includes("554") ||
		m.includes("bounce") ||
		m.includes("user unknown") ||
		m.includes("no such user") ||
		m.includes("mailbox not found") ||
		m.includes("recipient rejected") ||
		m.includes("does not exist")
	) {
		return {
			category: "Mailbox Rejected",
			summary: "Receiving server rejected the address — the inbox may not exist or is inactive.",
			fixes: [
				"Confirm the recipient email address is valid",
				"Verify sender authentication (SPF, DKIM, DMARC)",
				"Check if the recipient's inbox is full",
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
			summary: "A spam filter or security policy on the receiving server blocked delivery.",
			fixes: [
				"Ensure your sending domain is not listed on DNS blocklists",
				"Configure SPF, DKIM and DMARC properly",
				"Review email copy to avoid spam trigger terms",
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
			summary: "Sending quota was exceeded on your provider or the recipient server.",
			fixes: [
				"Reduce message sending velocity",
				"Upgrade sending tier or quota",
				"Retry delivery after backoff interval",
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
			summary: "TLS/SSL negotiation failed with the recipient mail server.",
			fixes: [
				"Verify STARTTLS / TLS 1.2+ configuration",
				"Check domain TLS security policies",
				"Verify certificate validity on the destination server",
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
			summary: "Could not establish a connection to the destination mail server.",
			fixes: [
				"Check network routing and firewall rules",
				"Verify recipient mail server is online",
				"Try resending the message later",
			],
		};
	}

	// Attachment / size
	if (
		m.includes("message too large") ||
		m.includes("size limit") ||
		m.includes("attachment") ||
		m.includes("file too big")
	) {
		return {
			category: "Message Too Large",
			summary: "Email exceeds the maximum message size permitted by the destination server.",
			fixes: [
				"Remove or compress large attachments",
				"Host large files via secure download links",
			],
		};
	}

	// Generic fallback
	return {
		category: "Delivery Failure",
		summary: "The email could not be delivered to the recipient.",
		fixes: [
			"Verify the recipient email address",
			"Check your domain's DNS and authentication status",
			"Review MTA logs for additional delivery context",
		],
	};
}

interface MessageDeliveryErrorProps {
	errorMessage?: string | null;
	status?: string;
	className?: string;
}

export function MessageDeliveryError({
	errorMessage,
	status,
	className,
}: MessageDeliveryErrorProps) {
	const [copied, setCopied] = useState(false);

	const rawError = (errorMessage || "").trim();
	const displayError = rawError || (status === "failed" ? "Email delivery failed" : "Message not sent");
	const { category, summary, fixes } = classifyError(displayError);

	const handleCopy = (e: React.MouseEvent) => {
		e.stopPropagation();
		navigator.clipboard.writeText(rawError || displayError);
		setCopied(true);
		toast.success("Error details copied to clipboard");
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<div
			className={cn(
				"overflow-hidden rounded-xl border border-red-500/25 bg-red-50/40 transition-colors dark:border-red-500/20 dark:bg-red-950/20",
				className,
			)}
			onClick={(e) => e.stopPropagation()}
		>
			{/* Top bar */}
			<div className="flex flex-wrap items-center justify-between gap-2 border-red-500/15 border-b bg-red-500/[0.06] px-3.5 py-2.5 dark:border-red-500/15 dark:bg-red-500/10">
				<div className="flex min-w-0 items-center gap-2">
					<div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-red-500/15 text-red-600 dark:bg-red-500/20 dark:text-red-400">
						<Icon name="alert-triangle" className="size-3.5 shrink-0" />
					</div>
					<span className="font-semibold text-[13px] text-red-700 leading-none dark:text-red-400">
						Email was not sent
					</span>
					<span className="text-red-400/40 text-xs">|</span>
					<span className="inline-flex items-center rounded-md bg-red-100/80 px-1.5 py-0.5 font-medium text-[11px] text-red-700 dark:bg-red-900/40 dark:text-red-300">
						{category}
					</span>
				</div>

				<button
					type="button"
					onClick={handleCopy}
					title="Copy error details"
					aria-label="Copy error details"
					className="inline-flex h-6 items-center gap-1 rounded-md border border-red-500/20 bg-white/70 px-2 font-medium text-[11px] text-red-700 shadow-xs transition-colors hover:bg-white dark:border-red-500/25 dark:bg-neutral-900/80 dark:text-red-300 dark:hover:bg-neutral-900"
				>
					<Icon name={copied ? "check" : "copy"} className="size-3 shrink-0" />
					<span>{copied ? "Copied" : "Copy error"}</span>
				</button>
			</div>

			{/* Details content */}
			<div className="space-y-3 p-3.5">
				{/* Reason summary */}
				<p className="font-medium text-[13px] text-neutral-800 leading-snug dark:text-neutral-200">
					{summary}
				</p>

				{/* Raw diagnostic message */}
				{rawError && (
					<div className="rounded-lg border border-red-500/15 bg-white/60 p-2.5 dark:border-red-500/10 dark:bg-black/30">
						<div className="mb-1 text-[11px] text-neutral-500 uppercase tracking-wider dark:text-neutral-400">
							Diagnostic Reason
						</div>
						<pre className="overflow-x-auto whitespace-pre-wrap break-all font-mono text-[12px] text-red-700 leading-relaxed dark:text-red-300">
							{rawError}
						</pre>
					</div>
				)}

				{/* Troubleshooting suggestions */}
				{fixes.length > 0 && (
					<div className="pt-0.5">
						<div className="mb-1.5 font-medium text-[11px] text-neutral-500 uppercase tracking-wider dark:text-neutral-400">
							Troubleshooting Suggestions
						</div>
						<ul className="space-y-1 text-[12px] text-neutral-700 dark:text-neutral-300">
							{fixes.map((fix) => (
								<li key={fix} className="flex items-start gap-1.5">
									<span className="mt-1.5 size-1 shrink-0 rounded-full bg-red-400/80 dark:bg-red-400" />
									<span>{fix}</span>
								</li>
							))}
						</ul>
					</div>
				)}
			</div>
		</div>
	);
}
