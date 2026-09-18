"use client";

import * as Alert from "@reloop/ui/alert";
import * as Badge from "@reloop/ui/badge";
import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import { KbdKey } from "@reloop/ui/kbd-key";
import Spinner from "@reloop/ui/spinner";
import * as TabMenuHorizontal from "@reloop/ui/tab-menu-horizontal";
import * as Tooltip from "@reloop/ui/tooltip";
import {
	type BatchPollResponse,
	type EmailHealthCheckResponse,
	HealthCheckRequestError,
	pollBatchHealthCheck,
	runSingleHealthCheck,
	submitBatchHealthCheck,
} from "@reloop/web/app/tools/email-validator/check-api";
import {
	ToolTopBar,
	ToolUpsell,
} from "@reloop/web/components/landing/tools/tool-chrome";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import {
	type ChangeEvent,
	type FormEvent,
	type KeyboardEvent,
	useEffect,
	useState,
} from "react";

type FilterVerdict = "all" | "deliverable" | "risky" | "disposable" | "invalid";

const actionKbdOnFilledClassName = cn(
	"h-4 w-auto min-w-4 rounded-[5px] px-1 font-mono text-[10px] leading-none",
	"border border-white/20 bg-white/15 text-white shadow-[0_1.5px_0_0_rgba(0,0,0,0.25)]",
	"dark:border-black/15 dark:bg-black/10 dark:text-text-strong-950 dark:shadow-[0_1.5px_0_0_rgba(0,0,0,0.15)]",
	"group-disabled:border-stroke-soft-200 group-disabled:bg-transparent group-disabled:text-text-disabled-300 group-disabled:shadow-none",
	"dark:group-disabled:border-white/10 dark:group-disabled:bg-transparent dark:group-disabled:text-white/30",
);

const batchResultsGridStyle = {
	gridTemplateColumns:
		"40px minmax(0, 1.35fr) 120px minmax(110px, 0.9fr) minmax(0, 1.4fr) minmax(130px, 1fr) 56px",
} as const;

const AVATAR_GRADIENTS = [
	"from-rose-500 to-pink-600",
	"from-pink-500 to-fuchsia-600",
	"from-fuchsia-500 to-purple-600",
	"from-purple-500 to-indigo-600",
	"from-indigo-500 to-blue-600",
	"from-blue-500 to-cyan-600",
	"from-cyan-500 to-teal-600",
	"from-teal-500 to-emerald-600",
	"from-emerald-500 to-green-600",
	"from-amber-500 to-orange-600",
	"from-orange-500 to-red-600",
	"from-violet-500 to-purple-600",
] as const;

function getAvatarGradient(seed: string): string {
	let hash = 5381;
	for (let i = 0; i < seed.length; i++) {
		hash = (hash * 33) ^ seed.charCodeAt(i);
	}
	const index = Math.abs(hash) % AVATAR_GRADIENTS.length;
	return `bg-gradient-to-br ${AVATAR_GRADIENTS[index]}`;
}

function getStatePresentation(state: string): {
	icon: string;
	className: string;
	label: string;
} {
	const normalized = state.toLowerCase();
	if (normalized === "deliverable") {
		return {
			icon: "check-circle",
			className: "text-success-base",
			label: "Deliverable",
		};
	}
	if (normalized === "risky" || normalized === "disposable") {
		return {
			icon: "alert-triangle",
			className: "text-warning-base",
			label: normalized === "disposable" ? "Disposable" : "Risky",
		};
	}
	return {
		icon: "minus-circle",
		className: "text-error-base",
		label:
			normalized === "invalid"
				? "Invalid"
				: normalized === "undeliverable"
					? "Undeliverable"
					: state.charAt(0).toUpperCase() + state.slice(1),
	};
}

const SAMPLE_EMAILS = [
	"alex@reloop.sh",
	"contact@google.com",
	"test@mailinator.com",
	"support@acme.corp",
];

const SAMPLE_CSV_CONTENT = `email,name,company
contact@google.com,Google Contact,Google
support@github.com,GitHub Support,GitHub
alex@reloop.email,Alex,Reloop
bill.gates@microsoft.com,Bill Gates,Microsoft
user@yahoo.com,Yahoo User,Personal
sales@stripe.com,Stripe Sales,Stripe
admin@cloudflare.com,Cloudflare Admin,Cloudflare
test@mailinator.com,Mailinator Tester,Disposable
random123@temp-mail.org,Temp Mail User,Disposable
demo@10minutemail.com,10 Minute User,Disposable
throwaway@yopmail.com,Yopmail User,Disposable
user@guerrillamail.com,Guerrilla User,Disposable
alex@reloop.sh,Alex No MX,Reloop
user@nonexistent-mx-domain-xyz-404.com,Ghost User,Dead Domain
bad-email-syntax@@domain.com,Bad Syntax 1,Invalid
missing-domain@,Bad Syntax 2,Invalid
not-an-email-at-all,Bad Syntax 3,Invalid
contact@google.com,Duplicate Google,Google
test@mailinator.com,Duplicate Mailinator,Disposable
support@github.com,Duplicate GitHub,GitHub`;

function getScoreBadgeColor(score: number): {
	text: string;
	bg: string;
	border: string;
	badge: "green" | "orange" | "red";
} {
	if (score >= 80) {
		return {
			text: "text-emerald-600 dark:text-emerald-400",
			bg: "bg-emerald-500/10",
			border: "border-emerald-500/20",
			badge: "green",
		};
	}
	if (score >= 50) {
		return {
			text: "text-amber-600 dark:text-amber-400",
			bg: "bg-amber-500/10",
			border: "border-amber-500/20",
			badge: "orange",
		};
	}
	return {
		text: "text-rose-600 dark:text-rose-400",
		bg: "bg-rose-500/10",
		border: "border-rose-500/20",
		badge: "red",
	};
}

export function EmailValidatorPageView() {
	const [activeTab, setActiveTab] = useState<string>("single");

	// Single check state
	const [singleEmail, setSingleEmail] = useState("");
	const [singleLoading, setSingleLoading] = useState(false);
	const [singleError, setSingleError] = useState<string | null>(null);
	const [singleResult, setSingleResult] =
		useState<EmailHealthCheckResponse | null>(null);
	const [copied, setCopied] = useState(false);

	// Bulk check state
	const [csvFile, setCsvFile] = useState<File | null>(null);
	const [pasteText, setPasteText] = useState("");
	const [bulkInputMode, setBulkInputMode] = useState<"upload" | "paste">(
		"upload",
	);
	const [bulkLoading, setBulkLoading] = useState(false);
	const [bulkError, setBulkError] = useState<string | null>(null);
	const [pollJob, setPollJob] = useState<BatchPollResponse | null>(null);
	const [filterVerdict, setFilterVerdict] = useState<FilterVerdict>("all");
	const [searchQuery, setSearchQuery] = useState("");
	const [pageIndex, setPageIndex] = useState(0);
	const PAGE_SIZE = 20;

	// API section snippet state
	const [apiLang, setApiLang] = useState<"curl" | "node" | "python">("curl");
	const [apiType, setApiType] = useState<"single" | "batch">("single");

	// Polling effect for batch jobs
	useEffect(() => {
		if (!pollJob || pollJob.status === "done" || pollJob.status === "failed") {
			return;
		}

		const token = pollJob.token;
		let timeoutId: ReturnType<typeof setTimeout>;

		async function poll() {
			try {
				const updated = await pollBatchHealthCheck(token);
				setPollJob(updated);
				if (updated.status === "queued" || updated.status === "running") {
					timeoutId = setTimeout(poll, 1000);
				} else {
					setBulkLoading(false);
				}
			} catch (err) {
				setBulkLoading(false);
				setBulkError(err instanceof Error ? err.message : "Polling failed");
			}
		}

		timeoutId = setTimeout(poll, 1000);
		return () => clearTimeout(timeoutId);
	}, [pollJob]);

	// Single check submit
	async function handleSingleSubmit(e?: FormEvent) {
		e?.preventDefault();
		if (!singleEmail.trim()) return;

		setSingleLoading(true);
		setSingleError(null);

		try {
			const res = await runSingleHealthCheck(singleEmail);
			setSingleResult(res);
		} catch (err) {
			if (err instanceof HealthCheckRequestError) {
				setSingleError(err.why || err.message);
			} else {
				setSingleError(
					err instanceof Error ? err.message : "Failed to verify email",
				);
			}
		} finally {
			setSingleLoading(false);
		}
	}

	// Bulk check submit
	async function handleBulkSubmit(e?: FormEvent) {
		e?.preventDefault();
		setBulkError(null);
		setPollJob(null);
		setPageIndex(0);

		if (bulkInputMode === "upload") {
			if (!csvFile) {
				setBulkError("Please choose a CSV or TXT file to upload.");
				return;
			}
			setBulkLoading(true);
			try {
				const res = await submitBatchHealthCheck({ file: csvFile });
				setPollJob({
					token: res.token,
					status: "queued",
					createdAt: new Date().toISOString(),
					completedAt: null,
					totalUploaded: 0,
					totalUnique: 0,
					duplicatesRemoved: 0,
					results: [],
					summary: null,
					error: null,
				});
			} catch (err) {
				setBulkLoading(false);
				setBulkError(err instanceof Error ? err.message : "Upload failed");
			}
		} else {
			const lines = pasteText
				.split(/\r?\n/)
				.map((l) => l.trim())
				.filter((l) => l.length > 0);
			if (lines.length === 0) {
				setBulkError("Please paste at least one email address.");
				return;
			}
			setBulkLoading(true);
			try {
				const res = await submitBatchHealthCheck({ emails: lines });
				setPollJob({
					token: res.token,
					status: "queued",
					createdAt: new Date().toISOString(),
					completedAt: null,
					totalUploaded: 0,
					totalUnique: 0,
					duplicatesRemoved: 0,
					results: [],
					summary: null,
					error: null,
				});
			} catch (err) {
				setBulkLoading(false);
				setBulkError(err instanceof Error ? err.message : "Submission failed");
			}
		}
	}

	function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0];
		if (file) {
			setCsvFile(file);
			setBulkError(null);
		}
	}

	function handleLoadSampleCsv() {
		const blob = new Blob([SAMPLE_CSV_CONTENT], { type: "text/csv" });
		const file = new File([blob], "sample-emails.csv", { type: "text/csv" });
		setCsvFile(file);
		setBulkInputMode("upload");
		setBulkError(null);
	}

	// Copy to clipboard
	function copyEmailToClipboard(text: string) {
		navigator.clipboard.writeText(text);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	}

	// Download results CSV
	function handleDownloadCsv(onlyDeliverable = false) {
		if (!pollJob?.results) return;

		let rows = pollJob.results;
		if (onlyDeliverable) {
			rows = rows.filter((r) => r.verdict === "deliverable");
		}

		const headers = [
			"Email",
			"State",
			"Score",
			"Reason",
			"Verdict",
			"Summary",
			"Is Free",
			"Is Role",
			"Is Disposable",
			"MX Records",
			"Implicit MX",
			"Flags",
		];

		const csvLines = [
			headers.join(","),
			...rows.map((r) =>
				[
					`"${r.email}"`,
					`"${r.health?.state || r.verdict}"`,
					r.health?.score ?? 0,
					`"${r.health?.reason || ""}"`,
					`"${r.verdict}"`,
					`"${(r.health?.summary || "").replace(/"/g, '""')}"`,
					r.isFreeProvider ? "TRUE" : "FALSE",
					r.isRoleAddress ? "TRUE" : "FALSE",
					r.isDisposable ? "TRUE" : "FALSE",
					`"${r.mxRecords.join("; ")}"`,
					r.health?.mailServer?.implicitMxRecord ? "TRUE" : "FALSE",
					`"${r.flags.join("; ")}"`,
				].join(","),
			),
		];

		const blob = new Blob([csvLines.join("\n")], {
			type: "text/csv;charset=utf-8;",
		});
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.setAttribute(
			"download",
			onlyDeliverable
				? "deliverable-emails-clean.csv"
				: "email-health-report.csv",
		);
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	}

	// Filtered results for bulk table
	const filteredRows = (pollJob?.results || []).filter((row) => {
		if (filterVerdict !== "all" && row.verdict !== filterVerdict) return false;
		if (searchQuery.trim()) {
			const q = searchQuery.toLowerCase();
			return (
				row.email.toLowerCase().includes(q) ||
				(row.domain && row.domain.includes(q))
			);
		}
		return true;
	});

	const totalPages = Math.ceil(filteredRows.length / PAGE_SIZE) || 1;
	const paginatedRows = filteredRows.slice(
		pageIndex * PAGE_SIZE,
		(pageIndex + 1) * PAGE_SIZE,
	);

	const scoreColors = getScoreBadgeColor(
		singleResult?.health?.score ??
			(singleResult?.verdict === "deliverable" ? 100 : 0),
	);

	return (
		<div className="min-h-screen bg-bg-weak-50/40 dark:bg-[#070709]">
			<ToolTopBar
				accent="emerald"
				breadcrumb={[
					{ label: "Tools", href: "/tools" },
					{ label: "Email Health Checker", href: "/tools/email-validator" },
				]}
				title="Free Email Health Checker"
				subtitle="Verify single addresses or upload up to 1,000 emails via CSV. Real-time deliverability score, disposable domain detection, role checks, and MX mail server analysis."
			/>

			<div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
				{/* Tab Navigation */}
				<div className="mb-6">
					<TabMenuHorizontal.Root
						value={activeTab}
						onValueChange={setActiveTab}
					>
						<TabMenuHorizontal.List>
							<TabMenuHorizontal.Trigger value="single">
								<Icon name="mail" className="size-4" />
								<span>Single Email</span>
							</TabMenuHorizontal.Trigger>
							<TabMenuHorizontal.Trigger value="bulk">
								<Icon name="layout" className="size-4" />
								<span>Bulk CSV (up to 1,000)</span>
							</TabMenuHorizontal.Trigger>
							<TabMenuHorizontal.Trigger value="api">
								<Icon name="code" className="size-4" />
								<span>Developer API</span>
							</TabMenuHorizontal.Trigger>
						</TabMenuHorizontal.List>
					</TabMenuHorizontal.Root>
				</div>

				{/* TAB 1: SINGLE ADDRESS CHECK */}
				{activeTab === "single" && (
					<div className="space-y-6">
						<div className="relative overflow-hidden rounded-3xl border border-stroke-soft-200 bg-bg-white-0 p-6 shadow-xs sm:p-8 dark:border-white/10 dark:bg-[#121212]">
							<form onSubmit={handleSingleSubmit} className="space-y-4">
								<div className="flex flex-col gap-3 sm:flex-row">
									<div className="flex-1">
										<Input.Root size="medium">
											<Input.Wrapper>
												<Input.Icon as={Icon} name="mail" />
												<Input.Input
													id="email-input"
													type="text"
													value={singleEmail}
													onChange={(e: ChangeEvent<HTMLInputElement>) => {
														setSingleEmail(e.target.value);
														if (singleError) setSingleError(null);
													}}
													onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
														if (e.key !== "Enter") return;
														e.preventDefault();
														if (singleLoading || !singleEmail.trim()) return;
														void handleSingleSubmit();
													}}
													placeholder="name@company.com"
													autoComplete="off"
													spellCheck={false}
												/>
											</Input.Wrapper>
										</Input.Root>
									</div>

									<FancyButton.Root
										variant="primary"
										size="medium"
										type="submit"
										disabled={singleLoading || !singleEmail.trim()}
										className="shrink-0 gap-1.5"
									>
										{singleLoading ? (
											<>
												<Spinner size={16} />
												<span>Checking…</span>
											</>
										) : (
											<>
												<FancyButton.Icon as={Icon} name="shield-check" />
												<span>Check Health</span>
												<KbdKey className={actionKbdOnFilledClassName}>
													↵
												</KbdKey>
											</>
										)}
									</FancyButton.Root>
								</div>

								{/* Sample Email Pills */}
								<div className="flex flex-wrap items-center gap-2 pt-1 font-medium text-paragraph-xs text-text-sub-600 dark:text-white/50">
									<span>Try:</span>
									{SAMPLE_EMAILS.map((sample) => (
										<button
											key={sample}
											type="button"
											onClick={() => {
												setSingleEmail(sample);
												setSingleError(null);
											}}
											className="rounded-lg border border-stroke-soft-200 bg-bg-weak-50/70 px-2.5 py-1 font-mono text-label-xs text-text-strong-950 transition hover:bg-bg-weak-100 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:hover:bg-white/[0.08]"
										>
											{sample}
										</button>
									))}
								</div>
							</form>

							{singleError && (
								<div className="mt-6">
									<Alert.Root variant="lighter" status="error" size="large">
										<Alert.Icon as={Icon} name="alert-triangle" />
										<div className="flex-1">
											<div className="font-medium text-label-sm">
												Evaluation Error
											</div>
											<p className="mt-0.5 text-paragraph-sm">{singleError}</p>
										</div>
									</Alert.Root>
								</div>
							)}
						</div>

						{/* RESULT INSPECTOR */}
						<AnimatePresence mode="wait">
							{singleResult && (
								<motion.div
									initial={{ opacity: 0, y: 12 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -12 }}
									transition={{ duration: 0.25 }}
									className="overflow-hidden rounded-3xl border border-stroke-soft-200 bg-bg-white-0 shadow-xs dark:border-white/10 dark:bg-[#121212]"
								>
									{/* Top Score Banner */}
									<div className="border-stroke-soft-200 border-b p-6 sm:p-7 dark:border-white/10">
										<div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
											<div className="flex items-center gap-3.5">
												<div className="flex size-11 items-center justify-center rounded-2xl bg-primary-base font-bold text-base text-white shadow-inner">
													{(
														singleResult.health?.user?.[0] ||
														singleResult.input?.[0] ||
														"E"
													).toUpperCase()}
												</div>
												<div>
													<div className="flex items-center gap-2">
														<span className="font-semibold text-text-strong-950 text-title-h6 dark:text-white">
															{singleResult.input}
														</span>
														<FancyButton.Root
															variant="ghost"
															size="xsmall"
															onClick={() =>
																copyEmailToClipboard(singleResult.input)
															}
															title="Copy address"
														>
															<FancyButton.Icon
																as={Icon}
																name={copied ? "check" : "copy"}
																className="size-3.5"
															/>
														</FancyButton.Root>
													</div>
													<p className="mt-0.5 text-paragraph-xs text-text-sub-600 dark:text-white/50">
														{singleResult.health?.summary}
													</p>
												</div>
											</div>

											{/* Score Badge */}
											<div
												className={cn(
													"flex size-14 flex-col items-center justify-center rounded-2xl border shadow-inner sm:size-16",
													scoreColors.bg,
													scoreColors.border,
												)}
											>
												<span
													className={cn(
														"font-bold font-mono text-2xl leading-none",
														scoreColors.text,
													)}
												>
													{singleResult.health?.score ??
														(singleResult.verdict === "deliverable" ? 100 : 0)}
												</span>
												<span className="mt-0.5 font-mono text-[9px] text-text-sub-600 uppercase dark:text-white/40">
													Score
												</span>
											</div>
										</div>

										{/* Deliverability Meter Slider */}
										<div className="mt-6 pt-2">
											<div className="relative pt-6 pb-1">
												{/* Indicator Pin */}
												<div
													className="-translate-x-1/2 absolute top-0 flex flex-col items-center transition-all duration-500"
													style={{
														left: `${Math.max(3, Math.min(97, singleResult.health?.score ?? (singleResult.verdict === "deliverable" ? 100 : 0)))}%`,
													}}
												>
													<span className="font-bold font-mono text-[11px] text-text-strong-950 dark:text-white">
														{singleResult.health?.score ??
															(singleResult.verdict === "deliverable"
																? 100
																: 0)}
													</span>
													<div className="size-1.5 rotate-45 bg-text-strong-950 dark:bg-white" />
												</div>

												{/* Continuous Gradient Bar */}
												<div className="flex h-2 w-full overflow-hidden rounded-full bg-bg-weak-50 dark:bg-white/5">
													<div className="w-[15%] bg-rose-500" />
													<div className="w-[65%] bg-amber-400" />
													<div className="w-[20%] bg-emerald-500" />
												</div>

												<div className="mt-1.5 flex justify-between font-mono text-[11px] text-text-sub-600 dark:text-white/40">
													<span>0 (Undeliverable)</span>
													<span>80 (Risky)</span>
													<span>100 (Deliverable)</span>
												</div>
											</div>
										</div>
									</div>

									{/* Section Cards */}
									<div className="space-y-6 p-6 sm:p-7">
										{/* General Section */}
										<div className="rounded-2xl border border-stroke-soft-200 bg-bg-weak-50/40 p-5 dark:border-white/10 dark:bg-white/[0.02]">
											<div className="mb-4 flex items-center justify-between">
												<h4 className="font-semibold text-label-sm text-text-strong-950 dark:text-white">
													General Overview
												</h4>
												<Badge.Root
													variant="lighter"
													color={scoreColors.badge}
													size="medium"
												>
													<Badge.Dot />
													<span className="capitalize">
														{singleResult.health?.state || singleResult.verdict}
													</span>
												</Badge.Root>
											</div>

											<div className="grid grid-cols-1 gap-y-3 sm:grid-cols-2">
												<div className="flex items-center justify-between pr-4">
													<span className="text-paragraph-sm text-text-sub-600 dark:text-white/50">
														Full Name
													</span>
													<span className="font-medium text-paragraph-sm text-text-strong-950 dark:text-white">
														—
													</span>
												</div>
												<div className="flex items-center justify-between pr-4">
													<span className="text-paragraph-sm text-text-sub-600 dark:text-white/50">
														State
													</span>
													<span
														className={cn(
															"flex items-center gap-1.5 font-semibold text-paragraph-sm",
															scoreColors.text,
														)}
													>
														<span className="size-1.5 rounded-full bg-current" />
														{singleResult.health?.state === "deliverable"
															? "Deliverable"
															: singleResult.health?.state === "risky"
																? "Risky"
																: "Undeliverable"}
													</span>
												</div>
												<div className="flex items-center justify-between pr-4">
													<span className="text-paragraph-sm text-text-sub-600 dark:text-white/50">
														Gender / Year
													</span>
													<span className="font-medium text-paragraph-sm text-text-strong-950 dark:text-white">
														—
													</span>
												</div>
												<div className="flex items-center justify-between pr-4">
													<span className="text-paragraph-sm text-text-sub-600 dark:text-white/50">
														Reason
													</span>
													<span className="rounded-md border border-stroke-soft-200 bg-bg-white-0 px-2 py-0.5 font-mono text-[11px] text-text-strong-950 uppercase shadow-2xs dark:border-white/10 dark:bg-white/10 dark:text-white">
														{singleResult.health?.reason?.toUpperCase() ||
															(singleResult.mxRecords.length === 0
																? "NO_MX_RECORDS"
																: "ACCEPTED_EMAIL")}
													</span>
												</div>
												<div className="flex items-center justify-between pr-4">
													<span className="text-paragraph-sm text-text-sub-600 dark:text-white/50">
														Domain
													</span>
													<span className="font-mono text-paragraph-sm text-primary-base">
														{singleResult.domain ||
															singleResult.input.split("@")[1] ||
															"—"}
													</span>
												</div>
												<div className="flex items-center justify-between pr-4">
													<span className="text-paragraph-sm text-text-sub-600 dark:text-white/50">
														Syntax Check
													</span>
													<span className="font-medium text-emerald-600 text-paragraph-sm dark:text-emerald-400">
														{singleResult.isValidSyntax
															? "RFC 5322 Valid"
															: "Invalid"}
													</span>
												</div>
											</div>
										</div>

										{/* Attributes Section */}
										<div className="rounded-2xl border border-stroke-soft-200 bg-bg-weak-50/40 p-5 dark:border-white/10 dark:bg-white/[0.02]">
											<h4 className="mb-4 font-semibold text-label-sm text-text-strong-950 dark:text-white">
												Attributes & Signals
											</h4>
											<div className="grid grid-cols-1 gap-y-3 sm:grid-cols-2">
												<div className="flex items-center justify-between pr-4 text-paragraph-sm">
													<span className="flex items-center gap-2 text-text-sub-600 dark:text-white/50">
														<Icon
															name="dollar"
															className="size-4 text-text-sub-600/60"
														/>
														Free Provider
													</span>
													<span className="font-medium text-text-strong-950 dark:text-white">
														{singleResult.health?.attributes?.free ||
														singleResult.isFreeProvider
															? "Yes"
															: "No"}
													</span>
												</div>
												<div className="flex items-center justify-between pr-4 text-paragraph-sm">
													<span className="flex items-center gap-2 text-text-sub-600 dark:text-white/50">
														<Icon
															name="user"
															className="size-4 text-text-sub-600/60"
														/>
														Numerical Characters
													</span>
													<span className="font-medium text-text-strong-950 dark:text-white">
														{singleResult.health?.attributes
															?.numericalCharacters ?? 0}
													</span>
												</div>
												<div className="flex items-center justify-between pr-4 text-paragraph-sm">
													<span className="flex items-center gap-2 text-text-sub-600 dark:text-white/50">
														<Icon
															name="user-role"
															className="size-4 text-text-sub-600/60"
														/>
														Role Account
													</span>
													<span className="font-medium text-text-strong-950 dark:text-white">
														{singleResult.health?.attributes?.role ||
														singleResult.isRoleAddress
															? "Yes"
															: "No"}
													</span>
												</div>
												<div className="flex items-center justify-between pr-4 text-paragraph-sm">
													<span className="flex items-center gap-2 text-text-sub-600 dark:text-white/50">
														<Icon
															name="edit"
															className="size-4 text-text-sub-600/60"
														/>
														Alphabetical Characters
													</span>
													<span className="font-medium text-text-strong-950 dark:text-white">
														{singleResult.health?.attributes
															?.alphabeticalCharacters ?? 4}
													</span>
												</div>
												<div className="flex items-center justify-between pr-4 text-paragraph-sm">
													<span className="flex items-center gap-2 text-text-sub-600 dark:text-white/50">
														<Icon
															name="shield-cross"
															className="size-4 text-text-sub-600/60"
														/>
														Disposable Mailbox
													</span>
													<span className="font-medium text-text-strong-950 dark:text-white">
														{singleResult.health?.attributes?.disposable ||
														singleResult.isDisposable
															? "Yes"
															: "No"}
													</span>
												</div>
												<div className="flex items-center justify-between pr-4 text-paragraph-sm">
													<span className="flex items-center gap-2 text-text-sub-600 dark:text-white/50">
														<Icon
															name="globe"
															className="size-4 text-text-sub-600/60"
														/>
														Unicode Symbols
													</span>
													<span className="font-medium text-text-strong-950 dark:text-white">
														{singleResult.health?.attributes?.unicodeSymbols ??
															0}
													</span>
												</div>
												<div className="flex items-center justify-between pr-4 text-paragraph-sm">
													<span className="flex items-center gap-2 text-text-sub-600 dark:text-white/50">
														<Icon
															name="mail"
															className="size-4 text-text-sub-600/60"
														/>
														Accept-All
													</span>
													<span className="font-medium text-text-strong-950 dark:text-white">
														No
													</span>
												</div>
												<div className="flex items-center justify-between pr-4 text-paragraph-sm">
													<span className="flex items-center gap-2 text-text-sub-600 dark:text-white/50">
														<Icon
															name="inbox"
															className="size-4 text-text-sub-600/60"
														/>
														Mailbox Full
													</span>
													<span className="font-medium text-text-strong-950 dark:text-white">
														No
													</span>
												</div>
												<div className="flex items-center justify-between pr-4 text-paragraph-sm">
													<span className="flex items-center gap-2 text-text-sub-600 dark:text-white/50">
														<Icon
															name="tag"
															className="size-4 text-text-sub-600/60"
														/>
														Tagged Address
													</span>
													<span className="font-medium text-text-strong-950 dark:text-white">
														{singleResult.health?.attributes?.tag
															? "Yes"
															: "No"}
													</span>
												</div>
												<div className="flex items-center justify-between pr-4 text-paragraph-sm">
													<span className="flex items-center gap-2 text-text-sub-600 dark:text-white/50">
														<Icon
															name="slash"
															className="size-4 text-text-sub-600/60"
														/>
														No-Reply Address
													</span>
													<span className="font-medium text-text-strong-950 dark:text-white">
														{singleResult.health?.attributes?.noReply
															? "Yes"
															: "No"}
													</span>
												</div>
												<div className="flex items-center justify-between pr-4 text-paragraph-sm">
													<span className="flex items-center gap-2 text-text-sub-600 dark:text-white/50">
														<Icon
															name="shield-check"
															className="size-4 text-text-sub-600/60"
														/>
														Secure Email Gateway
													</span>
													<span className="font-medium text-text-strong-950 dark:text-white">
														{singleResult.health?.attributes?.secureEmailGateway
															? "Yes"
															: "No"}
													</span>
												</div>
											</div>
										</div>

										{/* Mail Server Section */}
										<div className="rounded-2xl border border-stroke-soft-200 bg-bg-weak-50/40 p-5 dark:border-white/10 dark:bg-white/[0.02]">
											<h4 className="mb-4 font-semibold text-label-sm text-text-strong-950 dark:text-white">
												Mail Server & DNS Infrastructure
											</h4>
											<div className="grid grid-cols-1 gap-y-3 sm:grid-cols-2">
												<div className="flex items-center justify-between pr-4 text-paragraph-sm">
													<span className="text-text-sub-600 dark:text-white/50">
														SMTP Provider
													</span>
													<span className="font-medium text-text-strong-950 dark:text-white">
														{singleResult.health?.mailServer?.smtpProvider ||
															"—"}
													</span>
												</div>
												<div className="flex items-center justify-between pr-4 text-paragraph-sm">
													<span className="text-text-sub-600 dark:text-white/50">
														Implicit MX Record
													</span>
													<span className="font-medium text-text-strong-950 dark:text-white">
														{singleResult.health?.mailServer?.implicitMxRecord
															? "Yes"
															: "No"}
													</span>
												</div>
												<div className="flex min-w-0 items-center justify-between gap-2 pr-4 text-paragraph-sm">
													<span className="shrink-0 text-text-sub-600 dark:text-white/50">
														MX Mail Record
													</span>
													<span className="truncate font-mono text-paragraph-sm text-text-strong-950 dark:text-white">
														{singleResult.health?.mailServer?.mxRecord ||
															(singleResult.mxRecords.length > 0
																? singleResult.mxRecords[0]
																: singleResult.domain || "—")}
													</span>
												</div>
											</div>
										</div>
									</div>
								</motion.div>
							)}
						</AnimatePresence>
					</div>
				)}

				{/* TAB 2: BULK CSV LIST CHECK */}
				{activeTab === "bulk" && (
					<div className="space-y-6">
						<div className="relative overflow-hidden rounded-3xl border border-stroke-soft-200 bg-bg-white-0 p-6 shadow-xs sm:p-8 dark:border-white/10 dark:bg-[#121212]">
							<div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
								<div>
									<h2 className="font-semibold text-text-strong-950 text-title-h5 dark:text-white">
										Batch List Health Verification
									</h2>
									<p className="mt-1 text-paragraph-sm text-text-sub-600 dark:text-white/55">
										Upload up to 1,000 email addresses via CSV/TXT or paste
										directly.
									</p>
								</div>
								<FancyButton.Root
									variant="basic"
									size="small"
									onClick={handleLoadSampleCsv}
								>
									<FancyButton.Icon as={Icon} name="file" />
									<span>Load Sample CSV</span>
								</FancyButton.Root>
							</div>

							{/* Input Mode Selector */}
							<div className="mb-5 flex gap-2">
								<FancyButton.Root
									variant={bulkInputMode === "upload" ? "primary" : "basic"}
									size="small"
									onClick={() => setBulkInputMode("upload")}
								>
									<FancyButton.Icon as={Icon} name="file-upload" />
									<span>Upload File</span>
								</FancyButton.Root>
								<FancyButton.Root
									variant={bulkInputMode === "paste" ? "primary" : "basic"}
									size="small"
									onClick={() => setBulkInputMode("paste")}
								>
									<FancyButton.Icon as={Icon} name="edit" />
									<span>Paste Text</span>
								</FancyButton.Root>
							</div>

							<form
								onSubmit={handleBulkSubmit}
								onKeyDown={(e) => {
									if (e.key !== "Enter") return;
									if (e.target instanceof HTMLTextAreaElement) return;
									const canSubmit =
										!bulkLoading &&
										((bulkInputMode === "upload" && Boolean(csvFile)) ||
											(bulkInputMode === "paste" && Boolean(pasteText.trim())));
									if (!canSubmit) return;
									e.preventDefault();
									void handleBulkSubmit();
								}}
								className="space-y-4"
							>
								{bulkInputMode === "upload" ? (
									<div className="flex flex-col items-center justify-center rounded-2xl border-2 border-stroke-soft-200 border-dashed bg-bg-weak-50/40 p-8 text-center transition hover:border-emerald-500/40 dark:border-white/10 dark:bg-white/[0.02]">
										<div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
											<Icon name="upload" className="size-6" />
										</div>
										<p className="mt-3 font-semibold text-paragraph-sm text-text-strong-950 dark:text-white">
											{csvFile
												? csvFile.name
												: "Drag and drop CSV or TXT file here"}
										</p>
										<p className="mt-1 text-paragraph-xs text-text-sub-600 dark:text-white/45">
											{csvFile
												? `${Math.round(csvFile.size / 1024)} KB ready to verify`
												: "Supports .csv or .txt up to 512 KB and 1,000 addresses"}
										</p>
										<label htmlFor="csv-upload" className="mt-4 cursor-pointer">
											<span className="inline-flex items-center gap-2 rounded-xl border border-stroke-soft-200 bg-bg-white-0 px-4 py-2 font-medium text-label-sm text-text-strong-950 shadow-2xs hover:bg-bg-weak-50 dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/15">
												<Icon name="folder-move" className="size-4" />
												Browse File
											</span>
											<input
												id="csv-upload"
												type="file"
												accept=".csv,.txt"
												onChange={handleFileChange}
												className="hidden"
											/>
										</label>
									</div>
								) : (
									<div>
										<textarea
											rows={6}
											value={pasteText}
											onChange={(e) => setPasteText(e.target.value)}
											onKeyDown={(e: KeyboardEvent<HTMLTextAreaElement>) => {
												if (e.key !== "Enter" || (!e.metaKey && !e.ctrlKey))
													return;
												e.preventDefault();
												if (
													bulkLoading ||
													(bulkInputMode === "paste" && !pasteText.trim())
												)
													return;
												void handleBulkSubmit();
											}}
											placeholder="Paste one email per line (up to 1,000 addresses)..."
											className="w-full rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-4 font-mono text-[13px] text-text-strong-950 outline-none ring-primary-base/30 focus:ring-2 dark:border-white/10 dark:bg-black dark:text-white"
										/>
									</div>
								)}

								{bulkError && (
									<Alert.Root variant="lighter" status="error" size="large">
										<Alert.Icon as={Icon} name="alert-triangle" />
										<div className="min-w-0 flex-1 text-left">
											<div className="font-medium text-label-sm">
												Submission Error
											</div>
											<p className="mt-0.5 text-paragraph-sm">{bulkError}</p>
										</div>
									</Alert.Root>
								)}

								<FancyButton.Root
									variant="primary"
									size="medium"
									type="submit"
									disabled={
										bulkLoading ||
										(bulkInputMode === "upload" && !csvFile) ||
										(bulkInputMode === "paste" && !pasteText.trim())
									}
									className="w-full gap-1.5"
								>
									{bulkLoading ? (
										<>
											<Spinner size={18} />
											<span>Evaluating List (Checking MX & Catalogue)...</span>
										</>
									) : (
										<>
											<FancyButton.Icon as={Icon} name="shield-check" />
											<span>Start Batch Health Check</span>
											<KbdKey className={actionKbdOnFilledClassName}>↵</KbdKey>
										</>
									)}
								</FancyButton.Root>
							</form>

							{/* Active Polling Status */}
							{pollJob &&
								(pollJob.status === "queued" ||
									pollJob.status === "running") && (
									<motion.div
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0 }}
										className="mt-6 flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 dark:bg-emerald-500/10"
									>
										<Spinner size={20} />
										<div>
											<p className="font-semibold text-label-sm text-text-strong-950 dark:text-white">
												{pollJob.status === "queued"
													? "Job queued in background pipeline..."
													: "Running batch checks, DNS MX lookups, and domain caching..."}
											</p>
											<p className="mt-0.5 text-paragraph-xs text-text-sub-600 dark:text-white/50">
												Results will appear below as soon as evaluation
												finishes.
											</p>
										</div>
									</motion.div>
								)}
						</div>

						{/* Batch Results & Summary */}
						{pollJob && pollJob.status === "done" && pollJob.summary && (
							<motion.div
								initial={{ opacity: 0, y: 12 }}
								animate={{ opacity: 1, y: 0 }}
								className="space-y-6"
							>
								{/* Duplicate Notification Banner */}
								{pollJob.summary.duplicatesRemoved > 0 && (
									<div className="flex w-full items-start gap-3 rounded-xl border border-information-base/20 bg-information-lighter p-3.5 text-left text-text-strong-950">
										<Icon
											name="info"
											className="mt-0.5 size-5 shrink-0 text-information-base"
										/>
										<div className="min-w-0 flex-1">
											<div className="font-semibold text-label-sm">
												Deduplication Notice
											</div>
											<p className="mt-0.5 text-paragraph-sm text-text-sub-600">
												Found and removed{" "}
												<strong className="text-text-strong-950">
													{pollJob.summary.duplicatesRemoved} duplicate email(s)
												</strong>{" "}
												automatically. Evaluated{" "}
												<strong className="text-text-strong-950">
													{pollJob.summary.totalUnique}
												</strong>{" "}
												unique addresses.
											</p>
										</div>
									</div>
								)}

								{/* List Health Summary Card */}
								<div className="rounded-3xl border border-stroke-soft-200 bg-bg-white-0 p-6 shadow-xs sm:p-8 dark:border-white/10 dark:bg-[#121212]">
									<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
										<div>
											<span className="font-medium text-label-xs text-text-sub-600 uppercase tracking-wider dark:text-white/50">
												Overall List Health
											</span>
											<h3 className="mt-1 font-bold text-3xl text-text-strong-950 sm:text-4xl dark:text-white">
												{pollJob.summary.healthyPct}% Healthy
											</h3>
											<p className="mt-1 text-paragraph-sm text-text-sub-600 dark:text-white/60">
												{pollJob.summary.deliverableCount} of{" "}
												{pollJob.summary.totalUnique} unique addresses likely
												deliverable.
											</p>
										</div>

										<div className="flex flex-wrap gap-2">
											<FancyButton.Root
												variant="basic"
												size="small"
												onClick={() => handleDownloadCsv(false)}
											>
												<FancyButton.Icon as={Icon} name="file-download" />
												<span>Full CSV Report</span>
											</FancyButton.Root>
											<FancyButton.Root
												variant="primary"
												size="small"
												onClick={() => handleDownloadCsv(true)}
											>
												<FancyButton.Icon as={Icon} name="check" />
												<span>Clean List Only</span>
											</FancyButton.Root>
										</div>
									</div>

									{/* Category Count Badges */}
									<div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
										<div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3.5 text-emerald-800 dark:text-emerald-300">
											<p className="font-semibold text-label-xs uppercase">
												🟢 Deliverable
											</p>
											<p className="mt-1 font-bold font-mono text-2xl">
												{pollJob.summary.deliverableCount}
											</p>
										</div>
										<div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-3.5 text-amber-800 dark:text-amber-300">
											<p className="font-semibold text-label-xs uppercase">
												🟡 Risky / Role
											</p>
											<p className="mt-1 font-bold font-mono text-2xl">
												{pollJob.summary.riskyCount}
											</p>
										</div>
										<div className="rounded-2xl border border-orange-500/20 bg-orange-500/10 p-3.5 text-orange-800 dark:text-orange-300">
											<p className="font-semibold text-label-xs uppercase">
												🟠 Disposable
											</p>
											<p className="mt-1 font-bold font-mono text-2xl">
												{pollJob.summary.disposableCount}
											</p>
										</div>
										<div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-3.5 text-rose-800 dark:text-rose-300">
											<p className="font-semibold text-label-xs uppercase">
												🔴 Invalid
											</p>
											<p className="mt-1 font-bold font-mono text-2xl">
												{pollJob.summary.invalidCount}
											</p>
										</div>
										<div className="rounded-2xl border border-purple-500/20 bg-purple-500/10 p-3.5 text-purple-800 dark:text-purple-300">
											<p className="font-semibold text-label-xs uppercase">
												🌐 Missing MX
											</p>
											<p className="mt-1 font-bold font-mono text-2xl">
												{pollJob.summary.noMxCount}
											</p>
										</div>
									</div>
								</div>

								{/* Table Card */}
								<div className="overflow-hidden rounded-3xl border border-stroke-soft-200 bg-bg-white-0 shadow-xs dark:border-white/10 dark:bg-[#121212]">
									<div className="flex flex-col gap-3 border-stroke-soft-200 border-b p-4 sm:flex-row sm:items-center sm:justify-between dark:border-white/10">
										{/* Filter Tabs */}
										<div className="flex flex-wrap gap-1.5">
											{(
												[
													"all",
													"deliverable",
													"risky",
													"disposable",
													"invalid",
												] as const
											).map((cat) => (
												<button
													key={cat}
													type="button"
													onClick={() => {
														setFilterVerdict(cat);
														setPageIndex(0);
													}}
													className={cn(
														"rounded-xl px-3 py-1.5 font-medium text-label-xs capitalize transition",
														filterVerdict === cat
															? "bg-text-strong-950 text-white dark:bg-white dark:text-black"
															: "bg-bg-weak-50 text-text-sub-600 hover:bg-bg-weak-100 dark:bg-white/5 dark:text-white/50",
													)}
												>
													{cat}
												</button>
											))}
										</div>

										{/* Search Filter */}
										<div className="w-full sm:w-64">
											<Input.Root size="small">
												<Input.Wrapper>
													<Input.Icon as={Icon} name="search" />
													<Input.Input
														type="text"
														value={searchQuery}
														onChange={(e: ChangeEvent<HTMLInputElement>) => {
															setSearchQuery(e.target.value);
															setPageIndex(0);
														}}
														placeholder="Search email / domain..."
													/>
												</Input.Wrapper>
											</Input.Root>
										</div>
									</div>

									<div className="p-4 pt-3 text-paragraph-sm">
										<div
											style={batchResultsGridStyle}
											className="grid items-center rounded-t-[14px] border-stroke-soft-100 border-t border-r border-l bg-bg-weak-50/50 px-4 pt-2.5 pb-5 font-medium text-text-sub-600 text-xs dark:border-[#101010] dark:bg-bg-weak-50/40"
										>
											<div className="flex items-center">
												<span className="text-xs">#</span>
											</div>
											<div className="flex items-center gap-1">
												<Icon name="mail" className="h-3 w-3" />
												<span className="text-xs">Email</span>
											</div>
											<div className="flex items-center gap-1">
												<Icon name="check-circle" className="h-3 w-3" />
												<span className="text-xs">State</span>
											</div>
											<div className="flex items-center gap-1">
												<Icon name="code" className="h-3 w-3" />
												<span className="text-xs">Reason</span>
											</div>
											<div className="flex items-center gap-1">
												<Icon name="file-text" className="h-3 w-3" />
												<span className="text-xs">Summary</span>
											</div>
											<div className="flex items-center gap-1">
												<Icon name="server" className="h-3 w-3" />
												<span className="text-xs">MX</span>
											</div>
											<div className="flex items-center justify-end">
												<span className="text-xs">Score</span>
											</div>
										</div>

										<Tooltip.Provider delayDuration={200}>
											<div className="-mt-2.5 divide-y divide-stroke-soft-100 overflow-hidden rounded-xl border border-stroke-soft-100 bg-bg-white-0 dark:divide-stroke-soft-100/50 dark:border-stroke-soft-100/40 dark:bg-[#121212]">
											{paginatedRows.length === 0 ? (
												<div className="px-4 py-10 text-center text-paragraph-sm text-text-sub-600 dark:text-white/40">
													No matching records found.
												</div>
											) : (
												paginatedRows.map((row) => {
													const state =
														row.health?.state ||
														(row.verdict === "deliverable"
															? "deliverable"
															: "undeliverable");
													const score =
														row.health?.score ??
														(state === "deliverable" ? 100 : 0);
													const stateUi = getStatePresentation(state);
													const reason =
														row.health?.reason ||
														(row.mxRecords.length === 0
															? "NO_MX_RECORDS"
															: "ACCEPTED_EMAIL");
													const initial = (
														row.email.split("@")[0]?.[0] || "?"
													).toUpperCase();

													return (
														<div
															key={`${row.rowNumber}-${row.email}`}
															style={batchResultsGridStyle}
															className="group/row grid w-full items-center px-4 py-2.5 text-left hover:bg-bg-weak-50 dark:hover:bg-white/[0.03]"
														>
															<div className="flex items-center">
																<span className="font-medium text-[12px] text-text-soft-400 tabular-nums">
																	{row.rowNumber}
																</span>
															</div>

															<div className="flex min-w-0 items-center gap-2 pr-3">
																<div
																	className={cn(
																		"flex size-5 shrink-0 items-center justify-center rounded-full font-semibold text-[10px] text-white shadow-sm",
																		getAvatarGradient(row.email),
																	)}
																>
																	{initial}
																</div>
																<span className="truncate font-medium text-label-sm text-text-strong-950 dark:text-white">
																	{row.email}
																</span>
															</div>

															<div className="flex items-center">
																<span
																	className={cn(
																		"flex items-center gap-1.5 font-medium text-[13px]",
																		stateUi.className,
																	)}
																>
																	<Icon
																		name={stateUi.icon}
																		className="h-3.5 w-3.5"
																	/>
																	{stateUi.label}
																</span>
															</div>

															<div className="flex min-w-0 items-center gap-1.5 pr-3">
																<Icon
																	name="code"
																	className="h-3.5 w-3.5 shrink-0 text-text-sub-600"
																/>
																<span className="truncate font-medium text-[12px] text-text-sub-600 uppercase tracking-wide dark:text-white/50">
																	{reason}
																</span>
															</div>

															<div className="min-w-0 pr-3">
																<span className="line-clamp-2 font-medium text-[13px] text-text-sub-600 dark:text-white/55">
																	{row.health?.summary || "—"}
																</span>
															</div>

															<div className="flex min-w-0 items-center gap-1.5 pr-3">
																{row.mxRecords.length > 0 ? (
																	<Tooltip.Root>
																		<Tooltip.Trigger asChild>
																			<button
																				type="button"
																				className="flex min-w-0 cursor-default items-center gap-1.5 text-left"
																			>
																				<Icon
																					name="check-circle"
																					className="h-3.5 w-3.5 shrink-0 text-success-base"
																				/>
																				<span className="truncate font-medium text-[13px] text-success-base">
																					{row.mxRecords[0]}
																				</span>
																			</button>
																		</Tooltip.Trigger>
																		<Tooltip.Content
																			side="top"
																			size="xsmall"
																			variant="dark"
																			className="max-w-xs break-all font-mono"
																		>
																			{row.mxRecords[0]}
																		</Tooltip.Content>
																	</Tooltip.Root>
																) : (
																	<>
																		<Icon
																			name="minus-circle"
																			className="h-3.5 w-3.5 shrink-0 text-error-base"
																		/>
																		<span className="font-medium text-[13px] text-error-base">
																			No MX
																		</span>
																	</>
																)}
															</div>

															<div className="flex items-center justify-end">
																<span
																	className={cn(
																		"font-semibold text-[13px] tabular-nums",
																		score >= 80
																			? "text-success-base"
																			: score >= 50
																				? "text-warning-base"
																				: "text-error-base",
																	)}
																>
																	{score}
																</span>
															</div>
														</div>
													);
												})
											)}

											<div className="flex items-center justify-between gap-3 px-4 py-3 text-paragraph-sm">
												<p className="text-[12px] text-text-sub-600 dark:text-white/50">
													{filteredRows.length === 0
														? "0 results"
														: `Showing ${pageIndex * PAGE_SIZE + 1} – ${Math.min(
																(pageIndex + 1) * PAGE_SIZE,
																filteredRows.length,
															)} of ${filteredRows.length}`}
												</p>
												{totalPages > 1 && (
													<div className="flex gap-2">
														<FancyButton.Root
															variant="basic"
															size="xsmall"
															disabled={pageIndex === 0}
															onClick={() =>
																setPageIndex((p) => Math.max(0, p - 1))
															}
														>
															<span>Previous</span>
														</FancyButton.Root>
														<FancyButton.Root
															variant="basic"
															size="xsmall"
															disabled={pageIndex >= totalPages - 1}
															onClick={() =>
																setPageIndex((p) =>
																	Math.min(totalPages - 1, p + 1),
																)
															}
														>
															<span>Next</span>
														</FancyButton.Root>
													</div>
												)}
											</div>
										</div>
										</Tooltip.Provider>
									</div>
								</div>
							</motion.div>
						)}
					</div>
				)}

				{/* TAB 3: DEVELOPER API SNIPPETS */}
				{activeTab === "api" && (
					<div className="relative overflow-hidden rounded-3xl border border-stroke-soft-200 bg-bg-white-0 p-6 shadow-xs sm:p-8 dark:border-white/10 dark:bg-[#121212]">
						<div className="space-y-6">
							<div>
								<h2 className="font-semibold text-text-strong-950 text-title-h5 dark:text-white">
									Public Email Health API
								</h2>
								<p className="mt-1 text-paragraph-sm text-text-sub-600 dark:text-white/55">
									No authentication or API key required. Rate-limited per IP
									address.
								</p>
							</div>

							<div className="flex flex-wrap gap-2">
								<FancyButton.Root
									variant={apiType === "single" ? "primary" : "basic"}
									size="small"
									onClick={() => setApiType("single")}
								>
									<span>Single Check API</span>
								</FancyButton.Root>
								<FancyButton.Root
									variant={apiType === "batch" ? "primary" : "basic"}
									size="small"
									onClick={() => setApiType("batch")}
								>
									<span>Batch Check API (Async)</span>
								</FancyButton.Root>
							</div>

							<div className="overflow-hidden rounded-2xl border border-stroke-soft-200 bg-[#0d0d0f] p-4 text-white dark:border-white/10">
								<div className="mb-3 flex items-center justify-between border-white/10 border-b pb-3">
									<div className="flex gap-1.5">
										{(["curl", "node", "python"] as const).map((lang) => (
											<button
												key={lang}
												type="button"
												onClick={() => setApiLang(lang)}
												className={cn(
													"rounded-lg px-2.5 py-1 font-medium text-label-xs capitalize transition",
													apiLang === lang
														? "bg-white/20 text-white"
														: "text-white/50 hover:text-white",
												)}
											>
												{lang}
											</button>
										))}
									</div>
									<span className="font-mono text-[11px] text-white/40">
										{apiType === "single"
											? "POST /v1/email-health-check"
											: "POST /v1/email-health-check/batch"}
									</span>
								</div>

								<pre className="overflow-x-auto p-2 font-mono text-[13px] text-emerald-400">
									{apiType === "single"
										? apiLang === "curl"
											? `curl -X POST https://reloop.sh/api/tools/v1/email-health-check \\
  -H "Content-Type: application/json" \\
  -d '{"email": "alex@reloop.sh"}'`
											: apiLang === "node"
												? `const res = await fetch("https://reloop.sh/api/tools/v1/email-health-check", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: "alex@reloop.sh" }),
});
const data = await res.json();
console.log(data.health.state, data.health.score, data.health.reason);`
												: `import requests

res = requests.post(
    "https://reloop.sh/api/tools/v1/email-health-check",
    json={"email": "alex@reloop.sh"}
)
print(res.json())`
										: apiLang === "curl"
											? `# 1. Submit batch job (JSON array or multipart CSV)
curl -X POST https://reloop.sh/api/tools/v1/email-health-check/batch \\
  -H "Content-Type: application/json" \\
  -d '{"emails": ["user1@gmail.com", "user2@mailinator.com"]}'

# 2. Poll job status
curl https://reloop.sh/api/tools/v1/email-health-check/batch/YOUR_TOKEN`
											: apiLang === "node"
												? `// 1. Submit batch job
const createRes = await fetch("https://reloop.sh/api/tools/v1/email-health-check/batch", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ emails: ["user1@gmail.com", "user2@mailinator.com"] }),
});
const { token } = await createRes.json();

// 2. Poll job results
const pollRes = await fetch(\`https://reloop.sh/api/tools/v1/email-health-check/batch/\${token}\`);
const report = await pollRes.json();
console.log(report.status, report.summary);`
												: `import requests
import time

# 1. Submit batch job
create_res = requests.post(
    "https://reloop.sh/api/tools/v1/email-health-check/batch",
    json={"emails": ["user1@gmail.com", "user2@mailinator.com"]}
)
token = create_res.json()["token"]

# 2. Poll job results
time.sleep(2)
poll_res = requests.get(f"https://reloop.sh/api/tools/v1/email-health-check/batch/{token}")
print(poll_res.json())`}
								</pre>
							</div>
						</div>
					</div>
				)}

				{/* Feature Cards Grid */}
				<div className="mt-8 grid gap-4 sm:grid-cols-3">
					{[
						{
							title: "Signup Forms & API",
							text: "Block disposable addresses, typos, and bad syntax before they enter your database.",
						},
						{
							title: "Bulk CSV Hygiene",
							text: "Upload list imports up to 1,000 addresses to prune dead domains and remove duplicates.",
						},
						{
							title: "Fast In-Memory Catalogue",
							text: "Evaluated against ~210k known disposable domains with zero mailbox SMTP probing.",
						},
					].map((item) => (
						<div
							key={item.title}
							className="rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-5 shadow-2xs dark:border-white/10 dark:bg-[#121212]"
						>
							<p className="font-semibold text-label-sm text-text-strong-950 dark:text-white">
								{item.title}
							</p>
							<p className="mt-1 text-paragraph-xs text-text-sub-600 dark:text-white/55">
								{item.text}
							</p>
						</div>
					))}
				</div>

				<p className="mt-8 text-center text-paragraph-xs text-text-sub-600 dark:text-white/35">
					Also check out the{" "}
					<Link
						href="/tools/temp-email-checker"
						className="text-primary-base hover:underline"
					>
						Disposable email specialist
					</Link>{" "}
					or{" "}
					<Link
						href="/tools/deliverability-tester"
						className="text-primary-base hover:underline"
					>
						Deliverability tester
					</Link>
					.
				</p>
			</div>

			<ToolUpsell
				title="Automate email verification in your applications"
				description="Connect Reloop's developer API to your signup flows, CRM imports, and transactional pipelines."
				primaryHref="/dashboard/signup"
				primaryLabel="Start free"
				secondaryHref="/features/email-validation"
				secondaryLabel="Validation API"
			/>
		</div>
	);
}
