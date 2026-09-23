"use client";

import { adminGet } from "@fe/console/lib/admin-api";
import {
	formatBytes,
	formatDateTime,
	formatRecipients,
} from "@fe/console/lib/format";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import * as TabMenu from "@reloop/ui/tab-menu-horizontal";
import { motion } from "framer-motion";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";

type EmailDetailData = {
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
	attachments?: Array<{
		id: string;
		filename: string;
		contentType: string;
		size: number;
		storagePath?: string;
		contentDisposition?: string | null;
		contentId?: string | null;
	}>;
	events?: Array<{
		id: string;
		type: string;
		metadata?: Record<string, unknown> | null;
		createdAt: string | Date;
	}>;
};

function formatHtml(html: string): string {
	if (!html) return "";
	const cleanHtml = html.replace(/>\s*</g, ">\n<");
	const lines = cleanHtml.split("\n");
	let indentLevel = 0;
	let formatted = "";
	const tab = "  ";

	for (const raw of lines) {
		const line = raw?.trim();
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

function formatLongDate(value: string | Date | null | undefined) {
	if (!value) return "—";
	return new Date(value).toLocaleString(undefined, {
		weekday: "long",
		year: "numeric",
		month: "long",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

function formatTimelineDate(timestamp?: string | Date | null): string | null {
	if (!timestamp) return null;
	const date = new Date(timestamp);
	if (Number.isNaN(date.getTime())) return null;
	const day = date.getDate();
	const month = date.toLocaleString("en-US", { month: "short" });
	const time = date.toLocaleString("en-US", {
		hour: "numeric",
		minute: "2-digit",
		hour12: true,
	});
	return `${day} ${month}, ${time.toLowerCase()}`;
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
		};
	}
	if (m.includes("spam") || m.includes("blocked") || m.includes("policy")) {
		return {
			category: "Spam / Policy Block",
			summary: "Delivery was rejected by a spam filter or server policy.",
		};
	}
	if (m.includes("rate limit") || m.includes("quota") || m.includes("421")) {
		return {
			category: "Rate Limit Exceeded",
			summary: "Sending rate limit exceeded on provider or remote host.",
		};
	}
	return {
		category: "Delivery Failure",
		summary: "Delivery could not be completed.",
	};
}

function MetaRow({
	label,
	children,
	labelWidth = "w-24",
}: {
	label: string;
	children: React.ReactNode;
	labelWidth?: string;
}) {
	return (
		<div className="flex items-start gap-4">
			<span
				className={cn(
					"flex-shrink-0 font-medium text-paragraph-sm text-text-sub-600",
					labelWidth,
				)}
			>
				{label}
			</span>
			<div className="min-w-0 flex-1 font-medium text-paragraph-sm text-text-strong-950">
				{children}
			</div>
		</div>
	);
}

function CopyIconButton({ value, label }: { value: string; label: string }) {
	const [copied, setCopied] = useState(false);

	return (
		<button
			type="button"
			onClick={async () => {
				try {
					await navigator.clipboard.writeText(value);
					setCopied(true);
					toast.success(`${label} copied`);
					setTimeout(() => setCopied(false), 1600);
				} catch {
					toast.error("Failed to copy");
				}
			}}
			className="rounded p-1 text-text-soft-400 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950"
			title={`Copy ${label}`}
		>
			<Icon
				name={copied ? "check" : "copy"}
				className={cn("h-3 w-3", copied && "text-success-base")}
			/>
		</button>
	);
}

function BackButton({ fallbackHref }: { fallbackHref: string }) {
	const router = useRouter();
	const [hovered, setHovered] = useState(false);

	const handleBack = useCallback(() => {
		if (typeof window !== "undefined" && window.history.length <= 1) {
			router.push(fallbackHref);
			return;
		}
		router.back();
	}, [fallbackHref, router]);

	useEffect(() => {
		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key !== "Escape") return;
			if (
				document.querySelector(
					'[role="dialog"], [role="alertdialog"], [data-radix-popper-content-wrapper]',
				)
			) {
				return;
			}
			e.preventDefault();
			handleBack();
		};
		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [handleBack]);

	return (
		<motion.button
			type="button"
			onClick={handleBack}
			onHoverStart={() => setHovered(true)}
			onHoverEnd={() => setHovered(false)}
			whileTap={{ scale: 0.96 }}
			className="flex cursor-pointer items-center gap-1 py-1.5 pr-2 font-medium text-text-sub-600 text-xs transition-colors duration-200 hover:text-text-strong-950"
		>
			<div className="relative flex h-3.5 w-3.5 items-center">
				<motion.div
					className="-translate-y-1/2 absolute top-1/2 left-[1.5px] h-[1.5px] rounded-full bg-current"
					initial={{ width: 0, opacity: 0 }}
					animate={{
						width: hovered ? 10 : 0,
						opacity: hovered ? 1 : 0,
					}}
					transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
				/>
				<svg
					width={6}
					height={10}
					viewBox="0 0 6 10"
					fill="none"
					className="absolute left-0"
					aria-hidden
				>
					<path
						d="M5 1L1.5 5L5 9"
						stroke="currentColor"
						strokeWidth={1.5}
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</svg>
			</div>
			<span>Back</span>
			<span className="rounded-md border border-stroke-soft-200 bg-bg-weak-50 px-1.5 py-0.5 font-sans text-[10px] text-text-sub-600 lowercase dark:border-white/10 dark:bg-white/[0.06]">
				esc
			</span>
		</motion.button>
	);
}

function DeliveryTimeline({
	email,
	isLoading,
}: {
	email: EmailDetailData | undefined;
	isLoading: boolean;
}) {
	const events = email?.events ?? [];
	const isFailed = Boolean(
		email?.errorMessage ||
			email?.failedAt ||
			events.some(
				(e) =>
					e.type === "bounced" || e.type === "failed" || e.type === "complaint",
			),
	);

	const stamped = useMemo(() => {
		const list = [...events];
		if (email?.sentAt && !list.find((e) => e.type === "sent")) {
			list.push({
				id: "synth-sent",
				type: "sent",
				createdAt: email.sentAt,
				metadata: {},
			});
		}
		if (
			!isFailed &&
			email?.deliveredAt &&
			!list.find((e) => e.type === "delivered")
		) {
			list.push({
				id: "synth-delivered",
				type: "delivered",
				createdAt: email.deliveredAt,
				metadata: {},
			});
		}
		if (isFailed && !list.find((e) => e.type === "failed")) {
			list.push({
				id: "synth-failed",
				type: "failed",
				createdAt: email?.failedAt || email?.sentAt || email?.createdAt || "",
				metadata: {},
			});
		}
		return list;
	}, [email, events, isFailed]);

	const steps = isFailed
		? [
				{ id: "sent", type: "sent", label: "Sent", icon: "send-1" },
				{ id: "failed", type: "failed", label: "Failed", icon: "cross-circle" },
			]
		: [
				{ id: "sent", type: "sent", label: "Sent", icon: "send-1" },
				{
					id: "delivered",
					type: "delivered",
					label: "Delivered",
					icon: "check-circle",
				},
				{ id: "opened", type: "opened", label: "Opened", icon: "eye-outline" },
				{
					id: "clicked",
					type: "clicked",
					label: "Clicked",
					icon: "cursor-click",
				},
			];

	const iconStyles = (type: string, completed: boolean) => {
		if (!completed) {
			return "border-stroke-soft-200 bg-bg-weak-50 text-text-sub-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400";
		}
		switch (type) {
			case "sent":
				return "border-information-base/20 bg-information-lighter/50 text-information-base";
			case "failed":
				return "border-error-light bg-error-lighter text-error-base";
			case "delivered":
				return "border-success-base/20 bg-success-lighter/50 text-success-base";
			case "opened":
				return "border-orange-500/20 bg-orange-50/50 text-orange-600 dark:bg-orange-950/30 dark:text-orange-400";
			case "clicked":
				return "border-purple-500/20 bg-purple-50/50 text-purple-600 dark:bg-purple-950/30 dark:text-purple-400";
			default:
				return "border-information-base/20 bg-information-lighter/50 text-information-base";
		}
	};

	const badgeStyles = (type: string, completed: boolean) => {
		if (!completed) {
			return "bg-bg-weak-50 text-text-sub-600 dark:bg-neutral-900 dark:text-neutral-400";
		}
		switch (type) {
			case "sent":
				return "bg-information-lighter text-information-base";
			case "failed":
				return "bg-error-lighter text-error-base";
			case "delivered":
				return "bg-success-lighter text-success-base";
			case "opened":
				return "bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400";
			case "clicked":
				return "bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400";
			default:
				return "bg-information-lighter text-information-base";
		}
	};

	return (
		<div
			className={cn(
				"relative flex h-[176px] w-full items-center justify-center rounded-3xl border border-stroke-soft-100 bg-bg-white-0 px-8 pt-6 pb-5 dark:border-stroke-soft-100/50 dark:bg-bg-white-0/5",
			)}
		>
			<div
				className={cn(
					"mx-auto flex items-start",
					isFailed
						? "w-64 justify-between"
						: "w-full max-w-2xl justify-between",
				)}
			>
				{steps.map((step, index) => {
					const event = stamped.find((e) => e.type === step.type);
					const completed = Boolean(event);
					const time = formatTimelineDate(event?.createdAt ?? null);

					return (
						<Fragment key={step.id}>
							<div className="flex min-w-[90px] flex-col items-center gap-2">
								<div
									className={cn(
										"flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] border",
										iconStyles(step.type, completed),
									)}
								>
									<Icon name={step.icon} className="h-5 w-5" />
								</div>
								<span
									className={cn(
										"rounded-md px-2 py-1 font-semibold text-xs",
										badgeStyles(step.type, completed),
									)}
								>
									{step.label}
								</span>
								<div className="flex h-4 items-center justify-center">
									{isLoading ? (
										<Skeleton className="h-3 w-16 rounded-md" />
									) : completed && time ? (
										<span className="whitespace-nowrap font-medium text-text-soft-400 text-xs">
											{time}
										</span>
									) : (
										<span className="h-4 w-16 opacity-0" aria-hidden />
									)}
								</div>
							</div>
							{index < steps.length - 1 ? (
								<div className="mt-5 h-0 flex-1 border-stroke-soft-100 border-t-[1.5px] border-dashed dark:border-neutral-800" />
							) : null}
						</Fragment>
					);
				})}
			</div>
		</div>
	);
}

function toEmailList(value: unknown): string[] {
	if (Array.isArray(value)) {
		return value.filter((v): v is string => typeof v === "string");
	}
	if (typeof value === "string" && value) return [value];
	return [];
}

export default function EmailDetailPage() {
	const params = useParams<{ emailId: string }>();
	const emailId = params.emailId;
	const [activeTab, setActiveTab] = useState("preview");
	const [previewTheme, setPreviewTheme] = useState<"light" | "dark">("light");

	const {
		data: email,
		isLoading,
		error,
	} = useSWR<EmailDetailData>(emailId ? `/emails/${emailId}` : null, () =>
		adminGet<EmailDetailData>(`/emails/${emailId}`),
	);

	const copyToClipboard = (text: string, label: string) => {
		navigator.clipboard.writeText(text);
		toast.success(`${label} copied to clipboard`);
	};

	const downloadEml = (raw: string, filename: string) => {
		try {
			const normalized = raw.replace(/\r?\n/g, "\r\n");
			const blob = new Blob([normalized], { type: "message/rfc822" });
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = filename.endsWith(".eml") ? filename : `${filename}.eml`;
			document.body.appendChild(a);
			a.click();
			a.remove();
			URL.revokeObjectURL(url);
			toast.success("EML file downloaded");
		} catch {
			toast.error("Failed to download EML file");
		}
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

	useEffect(() => {
		if (!email) return;
		if (!email.htmlBody && activeTab === "preview") {
			setActiveTab("plain");
		}
	}, [email, activeTab]);

	const toEmails = toEmailList(email?.toEmails);
	const ccEmails = toEmailList(email?.ccEmails);
	const attachmentCount = email?.attachments?.length ?? 0;
	const eventCount = email?.events?.length ?? 0;

	const tabItems = useMemo(() => {
		const items = [
			{ value: "preview", title: "Preview", icon: "mail-single" },
			{ value: "plain", title: "Plain Text", icon: "file-text" },
			{ value: "html", title: "HTML Source", icon: "code" },
			{ value: "raw", title: "Raw", icon: "file-code" },
			{ value: "headers", title: "Headers", icon: "list" },
			{
				value: "attachments",
				title: `Files (${attachmentCount})`,
				icon: "paperclip",
			},
			{
				value: "timeline",
				title: `Timeline (${eventCount})`,
				icon: "history",
			},
			{ value: "insights", title: "Insights", icon: "bulb" },
		];
		if (email && !email.htmlBody) {
			return items.filter((t) => t.value !== "preview" && t.value !== "html");
		}
		return items;
	}, [attachmentCount, email, eventCount]);

	if (error && !email && !isLoading) {
		return (
			<div className="mx-auto flex min-h-[calc(100vh-200px)] max-w-3xl flex-col items-center justify-center px-4 sm:px-8">
				<p className="font-medium text-[15px] text-text-strong-950">
					Email not found
				</p>
				<p className="mt-1 text-[13px] text-text-sub-600">
					This email log may have been deleted or the ID is invalid.
				</p>
				<Button.Root
					asChild
					variant="neutral"
					mode="stroke"
					size="small"
					className="mt-4"
				>
					<Link href="/emails">Back to emails</Link>
				</Button.Root>
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-3xl px-4 sm:px-8">
			<div className="flex items-center justify-between gap-3 pt-4 pb-8">
				<BackButton fallbackHref="/emails" />
				{email ? (
					<div className="flex flex-wrap items-center justify-end gap-2">
						<Button.Root
							variant="neutral"
							mode="stroke"
							size="small"
							onClick={() => copyToClipboard(email.id, "Email ID")}
							className="h-8 gap-1.5 rounded-lg px-3 font-medium text-xs"
						>
							<Icon name="copy" className="h-3.5 w-3.5" />
							Copy ID
						</Button.Root>
						<Button.Root
							asChild
							variant="neutral"
							mode="stroke"
							size="small"
							className="h-8 gap-1.5 rounded-lg px-3 font-medium text-xs"
						>
							<Link href={`/organizations/${email.organizationId}`}>
								Open org hub
							</Link>
						</Button.Root>
					</div>
				) : null}
			</div>

			<div className="space-y-6 pb-16">
				{/* Metadata — dashboard-style key/value rows */}
				<section>
					<div className="flex flex-col gap-3.5">
						<MetaRow label="From">
							{isLoading ? (
								<Skeleton className="h-4 w-64 rounded-md" />
							) : email?.fromName ? (
								`${email.fromName} <${email.fromEmail}>`
							) : (
								email?.fromEmail
							)}
						</MetaRow>

						<MetaRow label="To">
							{isLoading ? (
								<Skeleton className="h-4 w-48 rounded-md" />
							) : toEmails.length > 0 ? (
								toEmails.map((addr, idx) => (
									<span key={addr}>
										{idx > 0 && ", "}
										<span className="underline decoration-dotted underline-offset-2">
											{addr}
										</span>
									</span>
								))
							) : (
								formatRecipients(email?.toEmails)
							)}
						</MetaRow>

						{ccEmails.length > 0 ? (
							<MetaRow label="Cc">
								{ccEmails.map((addr, idx) => (
									<span key={addr}>
										{idx > 0 && ", "}
										<span className="underline decoration-dotted underline-offset-2">
											{addr}
										</span>
									</span>
								))}
							</MetaRow>
						) : null}

						{email?.replyTo ? (
							<MetaRow label="Reply-To">{email.replyTo}</MetaRow>
						) : null}

						<MetaRow label="Date">
							{isLoading ? (
								<Skeleton className="h-4 w-56 rounded-md" />
							) : (
								formatLongDate(email?.createdAt)
							)}
						</MetaRow>

						<MetaRow label="Subject">
							{isLoading ? (
								<Skeleton className="h-4 w-80 rounded-md" />
							) : (
								email?.subject || "(no subject)"
							)}
						</MetaRow>

						<MetaRow label="Status">
							{isLoading ? (
								<Skeleton className="h-4 w-24 rounded-md" />
							) : (
								<span className="capitalize">{email?.status}</span>
							)}
						</MetaRow>

						<MetaRow label="Organization">
							{isLoading ? (
								<Skeleton className="h-4 w-32 rounded-md" />
							) : email ? (
								<Link
									href={`/organizations/${email.organizationId}`}
									className="underline decoration-dotted underline-offset-2 transition-colors hover:text-[#1868DF] dark:hover:text-blue-400"
								>
									{email.organizationName || email.organizationId}
								</Link>
							) : null}
						</MetaRow>

						{email?.domainName ? (
							<MetaRow label="Domain">{email.domainName}</MetaRow>
						) : null}

						<MetaRow label="Provider">
							{isLoading ? (
								<Skeleton className="h-4 w-24 rounded-md" />
							) : (
								<span className="capitalize">{email?.provider || "—"}</span>
							)}
						</MetaRow>

						<MetaRow label="Size">
							{isLoading ? (
								<Skeleton className="h-4 w-16 rounded-md" />
							) : (
								formatBytes(email?.size || email?.htmlBody?.length || 0)
							)}
						</MetaRow>

						{email?.sentAt ? (
							<MetaRow label="Sent At">{formatDateTime(email.sentAt)}</MetaRow>
						) : null}

						{email?.deliveredAt ? (
							<MetaRow label="Delivered">
								{formatDateTime(email.deliveredAt)}
							</MetaRow>
						) : null}

						{email?.failedAt ? (
							<MetaRow label="Failed At">
								<span className="text-error-base">
									{formatDateTime(email.failedAt)}
								</span>
							</MetaRow>
						) : null}

						<MetaRow label="Message ID">
							{isLoading ? (
								<Skeleton className="h-4 w-72 rounded-md" />
							) : email ? (
								<span className="inline-flex max-w-full items-center gap-1.5">
									<span className="truncate font-mono text-[12px]">
										{email.messageId}
									</span>
									<CopyIconButton value={email.messageId} label="Message ID" />
								</span>
							) : null}
						</MetaRow>

						<MetaRow label="Email ID">
							{isLoading ? (
								<Skeleton className="h-4 w-56 rounded-md" />
							) : email ? (
								<span className="inline-flex max-w-full items-center gap-1.5">
									<span className="truncate font-mono text-[12px]">
										{email.id}
									</span>
									<CopyIconButton value={email.id} label="Email ID" />
								</span>
							) : null}
						</MetaRow>

						{email?.providerMessageId ? (
							<MetaRow label="Provider ID">
								<span className="inline-flex max-w-full items-center gap-1.5">
									<span className="truncate font-mono text-[12px]">
										{email.providerMessageId}
									</span>
									<CopyIconButton
										value={email.providerMessageId}
										label="Provider ID"
									/>
								</span>
							</MetaRow>
						) : null}

						{attachmentCount > 0 ? (
							<MetaRow label="Files">
								<span className="text-text-sub-600">
									{attachmentCount} attachment
									{attachmentCount === 1 ? "" : "s"}
								</span>
							</MetaRow>
						) : null}
					</div>
				</section>

				{/* Delivery timeline */}
				<section>
					<DeliveryTimeline email={email} isLoading={isLoading} />
				</section>

				{/* Error callout */}
				{!isLoading && email?.errorMessage ? (
					<section>
						<div className="overflow-hidden rounded-2xl border border-error-light/40 bg-error-lighter/30 dark:bg-error-lighter/10">
							<div className="flex items-center gap-2.5 px-3.5 py-2.5 text-paragraph-sm">
								<Icon
									name="cross-circle"
									className="h-4 w-4 shrink-0 text-error-base"
								/>
								<span className="font-semibold text-error-base">
									{errorDiagnostic?.category || "Delivery Failed"}
								</span>
								<span className="text-stroke-sub-300">|</span>
								<span className="truncate font-medium text-text-sub-600">
									{errorDiagnostic?.summary || email.errorMessage}
								</span>
							</div>
							<div className="border-error-light/20 border-t bg-bg-weak-50/30 p-3.5 dark:bg-bg-weak-50/5">
								<pre className="overflow-x-auto whitespace-pre-wrap break-all font-mono text-error-base text-xs leading-relaxed">
									{email.errorMessage}
								</pre>
							</div>
						</div>
					</section>
				) : null}

				{/* Content tabs */}
				<section>
					<TabMenu.Root value={activeTab} onValueChange={setActiveTab}>
						<div className="mb-4 flex flex-wrap items-center justify-between gap-2">
							<TabMenu.List className="relative h-11 gap-0 border-b! py-0">
								{tabItems.map((item) => (
									<TabMenu.Trigger
										key={item.value}
										value={item.value}
										className="flex cursor-pointer items-center gap-2 px-3 py-0! font-medium text-sm"
									>
										<Icon name={item.icon} className="h-4 w-4" />
										{item.title}
									</TabMenu.Trigger>
								))}
							</TabMenu.List>

							{activeTab === "preview" ? (
								<div className="flex items-center gap-1">
									{(["light", "dark"] as const).map((theme) => (
										<button
											key={theme}
											type="button"
											onClick={() => setPreviewTheme(theme)}
											className={cn(
												"rounded-lg px-2 py-1 font-medium text-[11px] capitalize transition-colors",
												previewTheme === theme
													? "bg-bg-weak-50 font-semibold text-text-strong-950 dark:bg-white/[0.08]"
													: "text-text-sub-600 hover:text-text-strong-950",
											)}
										>
											{theme}
										</button>
									))}
								</div>
							) : null}
						</div>

						<div
							className={cn(
								"mb-4",
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
										{email?.htmlBody ? (
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
										) : email?.textBody ? (
											<pre className="min-h-[200px] whitespace-pre-wrap p-6 font-mono text-[12px]">
												{email.textBody}
											</pre>
										) : (
											<div className="p-6 text-paragraph-sm text-text-sub-600">
												No HTML or text body available for preview.
											</div>
										)}
									</TabMenu.Content>

									<TabMenu.Content value="plain">
										{email?.textBody ? (
											<div className="relative rounded-xl border border-stroke-soft-100 bg-bg-weak-50/50 p-4 dark:border-stroke-soft-100/40 dark:bg-white/[0.02]">
												<div className="mb-3 flex items-center justify-between">
													<span className="font-mono text-[11px] text-text-sub-600">
														text/plain
													</span>
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
														Copy
													</Button.Root>
												</div>
												<pre className="max-h-[420px] overflow-y-auto whitespace-pre-wrap font-mono text-[12px] text-text-strong-950">
													{email.textBody}
												</pre>
											</div>
										) : (
											<div className="p-6 text-paragraph-sm text-text-sub-600">
												No text content
											</div>
										)}
									</TabMenu.Content>

									<TabMenu.Content value="html">
										{email?.htmlBody ? (
											<div className="relative rounded-xl border border-stroke-soft-100 bg-bg-weak-50/50 p-4 dark:border-stroke-soft-100/40 dark:bg-white/[0.02]">
												<div className="mb-3 flex items-center justify-between">
													<span className="font-mono text-[11px] text-text-sub-600">
														text/html
													</span>
													<Button.Root
														size="xsmall"
														variant="neutral"
														mode="stroke"
														onClick={() =>
															copyToClipboard(email.htmlBody || "", "HTML")
														}
													>
														<Icon name="copy" className="h-3 w-3" />
														Copy
													</Button.Root>
												</div>
												<pre className="max-h-[420px] overflow-y-auto whitespace-pre-wrap break-all font-mono text-[11px] text-text-strong-950">
													{formatHtml(email.htmlBody)}
												</pre>
											</div>
										) : (
											<div className="p-6 text-paragraph-sm text-text-sub-600">
												No HTML content available
											</div>
										)}
									</TabMenu.Content>

									<TabMenu.Content value="raw">
										{email?.rawMessage ? (
											<div className="relative rounded-xl border border-stroke-soft-100 bg-bg-weak-50/50 p-4 dark:border-stroke-soft-100/40 dark:bg-white/[0.02]">
												<div className="mb-3 flex items-center justify-between">
													<span className="font-mono text-[11px] text-text-sub-600">
														RFC822 MIME
													</span>
													<div className="flex items-center gap-2">
														<Button.Root
															size="xsmall"
															variant="neutral"
															mode="stroke"
															onClick={() =>
																downloadEml(
																	email.rawMessage || "",
																	`${email.id}.eml`,
																)
															}
														>
															<Icon name="file-download" className="h-3 w-3" />
															Download .eml
														</Button.Root>
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
															Copy
														</Button.Root>
													</div>
												</div>
												<pre className="max-h-[420px] overflow-y-auto whitespace-pre-wrap break-all font-mono text-[11px] text-text-strong-950">
													{email.rawMessage}
												</pre>
											</div>
										) : (
											<p className="p-6 text-paragraph-sm text-text-sub-600">
												Raw MIME payload is not stored for this message.
											</p>
										)}
									</TabMenu.Content>

									<TabMenu.Content value="headers">
										{email?.headers && Object.keys(email.headers).length > 0 ? (
											<div className="overflow-hidden rounded-xl border border-stroke-soft-100 dark:border-stroke-soft-100/50">
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
											</div>
										) : (
											<div className="p-6 text-paragraph-sm text-text-sub-600">
												No custom headers stored with this record.
											</div>
										)}
									</TabMenu.Content>

									<TabMenu.Content value="attachments">
										{email?.attachments && email.attachments.length > 0 ? (
											<ul className="divide-y divide-stroke-soft-100 overflow-hidden rounded-xl border border-stroke-soft-100 dark:divide-stroke-soft-100/40 dark:border-stroke-soft-100/40">
												{email.attachments.map((att, i) => (
													<li
														key={att.id || `${att.filename}-${i}`}
														className="flex items-center justify-between gap-3 px-4 py-3 text-[13px]"
													>
														<div className="min-w-0">
															<div className="flex items-center gap-2">
																<Icon
																	name="paperclip"
																	className="h-4 w-4 shrink-0 text-text-soft-400"
																/>
																<p className="truncate font-medium text-text-strong-950">
																	{att.filename}
																</p>
															</div>
															<p className="mt-0.5 pl-6 text-[12px] text-text-sub-600">
																{att.contentType} · {formatBytes(att.size)}
															</p>
														</div>
													</li>
												))}
											</ul>
										) : (
											<div className="p-6 text-paragraph-sm text-text-sub-600">
												No attachments on this message.
											</div>
										)}
									</TabMenu.Content>

									<TabMenu.Content value="timeline">
										<div className="space-y-4 rounded-xl border border-stroke-soft-100 bg-bg-weak-50/40 p-4 dark:border-stroke-soft-100/40 dark:bg-white/[0.02]">
											<div className="flex items-start gap-3">
												<div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
													<Icon name="plus" className="h-3 w-3" />
												</div>
												<div className="min-w-0 flex-1">
													<div className="flex items-center justify-between gap-2">
														<p className="font-medium text-[13px] text-text-strong-950">
															Email queued / created
														</p>
														<span className="text-[11px] text-text-sub-600">
															{formatDateTime(email?.createdAt)}
														</span>
													</div>
													<p className="text-[12px] text-text-sub-600">
														Message accepted by SMTP gateway
													</p>
												</div>
											</div>

											{email?.events?.map((ev) => (
												<div
													key={ev.id}
													className="flex items-start gap-3 border-stroke-soft-100/60 border-t pt-3 dark:border-stroke-soft-100/30"
												>
													<div
														className={cn(
															"mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
															ev.type === "delivered"
																? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
																: ev.type === "failed" || ev.type === "bounced"
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
														<div className="flex items-center justify-between gap-2">
															<p className="font-medium text-[13px] text-text-strong-950 capitalize">
																{ev.type}
															</p>
															<span className="text-[11px] text-text-sub-600">
																{formatDateTime(ev.createdAt)}
															</span>
														</div>
														{ev.metadata ? (
															<pre className="mt-1.5 rounded-lg bg-black/5 p-2 font-mono text-[11px] text-text-sub-600 dark:bg-white/[0.04]">
																{JSON.stringify(ev.metadata, null, 2)}
															</pre>
														) : null}
													</div>
												</div>
											))}
										</div>
									</TabMenu.Content>

									<TabMenu.Content value="insights">
										<div className="space-y-3">
											{insights.map((item) => (
												<div
													key={item.title}
													className="flex items-start gap-3 rounded-xl border border-stroke-soft-100 bg-bg-weak-50/50 p-4 dark:border-stroke-soft-100/40 dark:bg-white/[0.02]"
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
									</TabMenu.Content>
								</>
							)}
						</div>
					</TabMenu.Root>
				</section>
			</div>
		</div>
	);
}
