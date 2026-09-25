"use client";

import * as Alert from "@reloop/ui/alert";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { FieldError, useFieldError } from "@reloop/ui/field-error";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import { LoadingDot } from "@reloop/ui/loading-dot";
import Spinner from "@reloop/ui/spinner";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import {
	type ClipboardEvent,
	type FormEvent,
	type ReactNode,
	useEffect,
	useRef,
	useState,
} from "react";
import { type DomainAgeReport, runDomainAge } from "./check-api";

const FIELD_ERROR_MESSAGE = "Please enter a valid domain (e.g. example.com).";

function getDomainParam(): string | null {
	if (typeof window === "undefined") return null;
	try {
		const param = new URLSearchParams(window.location.search).get("domain");
		return param && param.trim().length > 0 ? param.trim().slice(0, 253) : null;
	} catch {
		return null;
	}
}

function syncDomainParam(value: string | null) {
	if (typeof window === "undefined") return;
	try {
		const url = new URL(window.location.href);
		if (value && value.trim().length > 0)
			url.searchParams.set("domain", value.trim());
		else url.searchParams.delete("domain");
		window.history.replaceState(null, "", url.toString());
	} catch {}
}

function buildShareUrl(input: string): string {
	const base =
		typeof window !== "undefined"
			? `${window.location.origin}${window.location.pathname}`
			: "/tools/domain-age";
	return `${base}?domain=${encodeURIComponent(input)}`;
}

function validateInput(raw: string): { ok: boolean } {
	const v = raw.trim();
	if (!v || v.length < 3 || v.length > 253) return { ok: false };
	if (!v.includes(".")) return { ok: false };
	return { ok: true };
}

function normalizeDomainInput(raw: string): string {
	let v = raw.trim().toLowerCase();
	v = v.replace(/^https?:\/\//, "").split("/")[0] ?? "";
	v = v.split("?")[0] ?? "";
	v = v.split("#")[0] ?? "";
	v = v.split(":")[0] ?? "";
	return v;
}

function MorphSlot({
	activeKey,
	reduceMotion,
	children,
}: {
	activeKey: string | null;
	reduceMotion: boolean | null;
	children: ReactNode;
}) {
	const [height, setHeight] = useState<number | "auto">("auto");
	const [canAnimate, setCanAnimate] = useState(false);
	const innerRef = useRef<HTMLDivElement | null>(null);
	const setInnerRef = (node: HTMLDivElement | null) => {
		if (node) innerRef.current = node;
	};
	useEffect(() => setCanAnimate(true), []);
	useEffect(() => {
		if (!activeKey) {
			setHeight(0);
			return;
		}
		const el = innerRef.current;
		if (!el) return;
		const update = () =>
			setHeight(Math.ceil(el.getBoundingClientRect().height));
		update();
		if (typeof ResizeObserver === "undefined") return;
		const ro = new ResizeObserver(update);
		ro.observe(el);
		return () => ro.disconnect();
	}, [activeKey]);
	return (
		<motion.div
			initial={false}
			animate={{ height: reduceMotion ? "auto" : height }}
			transition={
				reduceMotion || !canAnimate
					? { duration: 0 }
					: { duration: 0.28, ease: [0.22, 1, 0.36, 1] as const }
			}
			className="relative overflow-hidden"
		>
			<AnimatePresence initial={false} mode="sync">
				{activeKey ? (
					<motion.div
						key={activeKey}
						initial={reduceMotion ? false : { opacity: 0, filter: "blur(2px)" }}
						animate={{ opacity: 1, filter: "blur(0px)", pointerEvents: "auto" }}
						exit={
							reduceMotion
								? { opacity: 0, pointerEvents: "none" }
								: { opacity: 0, filter: "blur(2px)", pointerEvents: "none" }
						}
						transition={
							reduceMotion
								? { duration: 0 }
								: { duration: 0.22, ease: [0.22, 1, 0.36, 1] as const }
						}
						className="absolute inset-x-0 top-0"
					>
						<div ref={setInnerRef}>{children}</div>
					</motion.div>
				) : null}
			</AnimatePresence>
		</motion.div>
	);
}

export function CheckerPanel() {
	const [domain, setDomain] = useState("somsevicingno.com");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [result, setResult] = useState<DomainAgeReport | null>(null);
	const [copied, setCopied] = useState(false);
	const [showRawRdap, setShowRawRdap] = useState(false);
	const field = useFieldError();
	const shouldReduceMotion = useReducedMotion();
	const hasFieldError = field.hasError;
	const abortRef = useRef<AbortController | null>(null);

	const executeCheck = async (targetDomain: string) => {
		const validity = validateInput(targetDomain);
		if (!validity.ok) {
			field.show(FIELD_ERROR_MESSAGE);
			return;
		}
		field.clear();
		const clean = normalizeDomainInput(targetDomain);
		abortRef.current?.abort();
		const controller = new AbortController();
		abortRef.current = controller;
		setIsLoading(true);
		setError(null);
		try {
			const res = await runDomainAge(clean, controller.signal);
			if (controller.signal.aborted) return;
			setResult(res);
		} catch (err) {
			if (err instanceof DOMException && err.name === "AbortError") return;
			setResult(null);
			setError((err as Error).message || "Failed to check domain age.");
		} finally {
			if (!controller.signal.aborted) setIsLoading(false);
		}
	};

	useEffect(
		() => () => {
			abortRef.current?.abort();
		},
		[],
	);

	const handleSubmit = (e: FormEvent) => {
		e.preventDefault();
		if (result || error) return;
		void executeCheck(domain);
	};

	const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
		if (isLoading) return;
		const pasted = e.clipboardData.getData("text").trim();
		if (!pasted) return;
		if (validateInput(pasted).ok) {
			e.preventDefault();
			const norm = normalizeDomainInput(pasted);
			setDomain(norm);
			if (hasFieldError) field.clear();
			setResult(null);
			setError(null);
			void executeCheck(pasted);
		}
	};

	const handleReset = () => {
		abortRef.current?.abort();
		setResult(null);
		setError(null);
		field.clear();
		setDomain("");
		syncDomainParam(null);
		setTimeout(() => field.inputRef.current?.focus(), 50);
	};

	const handleCopyReport = () => {
		if (!result) return;
		const report = `[Reloop Domain Age & Warmup Report]
Domain: ${result.domain}
Verdict: ${result.verdict.toUpperCase()}
Headline: ${result.headline}
Age: ${result.age.ageDays !== null ? `${result.age.ageDays} days` : "Unknown"}
Registered: ${result.age.createdAt ? new Date(result.age.createdAt).toLocaleDateString() : "Unknown"}
Registrar: ${result.registry.registrar || "Unknown"}
SPF: ${result.emailSetup.spf ? "Configured" : "Missing"}
DMARC: ${result.emailSetup.dmarc ? `Configured (${result.emailSetup.dmarcPolicy})` : "Missing"}
https://reloop.sh/tools/domain-age`;
		navigator.clipboard.writeText(report).then(() => {
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		});
	};

	const getTimelineProgress = (days: number | null): number => {
		if (days === null || days <= 0) return 3;
		if (days <= 7) return (days / 7) * 25;
		if (days <= 30) return 25 + ((days - 7) / 23) * 25;
		if (days <= 90) return 50 + ((days - 30) / 60) * 25;
		return Math.min(100, 75 + ((days - 90) / 275) * 25);
	};

	const hasChecked = Boolean(result || error);

	return (
		<div className="mx-auto w-full max-w-xl text-left font-sans">
			{/* Search Input Box — same as temp-email checker */}
			<form onSubmit={handleSubmit} noValidate className="space-y-2.5">
				<FieldError field={field} messageClassName="text-xs leading-relaxed">
					<div className="relative w-full">
						<Input.Root
							size="medium"
							hasError={hasFieldError}
							className={cn(
								"relative z-10 w-full rounded-xl bg-bg-white-0 shadow-xs transition-shadow sm:rounded-2xl dark:bg-[#0c0c0c]",
								hasFieldError
									? "has-[input:focus]:!shadow-button-error-focus has-[input:focus]:before:!ring-error-base"
									: "has-[input:focus]:before:!ring-primary-base has-[input:focus]:!shadow-button-primary-focus",
							)}
						>
							<Input.Wrapper className="h-12 pr-2 pl-4 dark:bg-[#0c0c0c]">
								<Input.Input
									id="checker-input"
									aria-label="Domain"
									{...field.controlProps}
									type="text"
									inputMode="url"
									autoComplete="off"
									autoCapitalize="none"
									spellCheck={false}
									value={domain}
									onPaste={handlePaste}
									onChange={(e) => {
										setDomain(e.target.value);
										if (hasFieldError) field.clear();
										if (result) setResult(null);
										if (error) setError(null);
									}}
									placeholder="Enter domain or URL (e.g. acme.com, https://acme.com)"
									className="font-medium text-[15px]"
								/>
								{hasChecked ? (
									<button
										type="button"
										onClick={handleReset}
										className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-text-sub-600 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 dark:text-white/45 dark:hover:bg-white/10 dark:hover:text-white"
										aria-label="Clear check"
									>
										<svg
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="2.5"
											strokeLinecap="round"
											strokeLinejoin="round"
											className="size-3.5"
											aria-hidden="true"
										>
											<path d="M18 6L6 18M6 6l12 12" />
										</svg>
									</button>
								) : (
									<FancyButton.Root
										type="submit"
										variant="primary"
										size="xsmall"
										className="!p-0 flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg dark:text-black"
										aria-label="Check domain age"
									>
										{isLoading ? (
											<LoadingDot
												size={13}
												dotSize={2}
												className="text-white dark:text-black"
											/>
										) : (
											<FancyButton.Icon className="mx-0 size-3.5 dark:text-black">
												<Icon
													name="arrow-right"
													className="size-3.5 text-white dark:text-black"
												/>
											</FancyButton.Icon>
										)}
									</FancyButton.Root>
								)}
							</Input.Wrapper>
						</Input.Root>
					</div>
				</FieldError>

				<MorphSlot
					activeKey={error ? "error" : result ? "result" : null}
					reduceMotion={shouldReduceMotion}
				>
					{error ? (
						<div className="flex items-start gap-2.5 rounded-xl border border-rose-500/20 bg-rose-500/5 p-3.5 text-text-sub-600 text-xs dark:text-white/60">
							<Icon
								name="alert-triangle"
								className="mt-0.5 size-4 shrink-0 text-rose-500"
							/>
							<p className="text-rose-600 leading-relaxed dark:text-rose-400">
								{error}
							</p>
						</div>
					) : result ? (
						<div className="space-y-6 pt-2">
							<div
								className={cn(
									"rounded-2xl border p-6 shadow-xs transition-colors sm:p-7",
									(result.verdict === "too_new" ||
										result.verdict === "held" ||
										result.verdict === "not_registered") &&
										"border-rose-500/30 bg-rose-500/[0.04] dark:border-rose-500/40 dark:bg-rose-500/[0.07]",
									(result.verdict === "cold" ||
										result.verdict === "warming" ||
										result.verdict === "unknown_age") &&
										"border-amber-500/30 bg-amber-500/[0.04] dark:border-amber-500/40 dark:bg-amber-500/[0.07]",
									(result.verdict === "established" ||
										result.verdict === "mature") &&
										"border-emerald-500/30 bg-emerald-500/[0.04] dark:border-emerald-500/40 dark:bg-emerald-500/[0.07]",
								)}
							>
								<div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
									<div>
										<h2 className="mt-3 font-semibold text-[22px] text-text-strong-950 tracking-tight sm:text-[26px] dark:text-white">
											{result.headline}
										</h2>
										{result.age.ageDays !== null && (
											<div className="mt-2 flex flex-wrap items-baseline gap-2">
												<span className="font-semibold text-[19px] text-text-strong-950 sm:text-[22px] dark:text-white">
													Registered{" "}
													{result.age.ageDays === 0
														? "today"
														: `${result.age.ageDays.toLocaleString()} days ago`}
												</span>
												{result.age.createdAt && (
													<span className="text-[13.5px] text-text-sub-600 dark:text-white/50">
														(
														{new Date(result.age.createdAt).toLocaleDateString(
															"en-US",
															{
																month: "long",
																day: "numeric",
																year: "numeric",
															},
														)}
														)
													</span>
												)}
											</div>
										)}
										<p className="mt-2 max-w-2xl text-[14.5px] text-text-sub-600 leading-relaxed dark:text-white/70">
											{result.summary}
										</p>
									</div>
									<div className="flex shrink-0 items-center gap-2">
										<Button.Root
											type="button"
											variant="neutral"
											mode="stroke"
											size="small"
											onClick={handleCopyReport}
										>
											<Button.Icon
												as={Icon}
												name={copied ? "check" : "copy"}
												className={copied ? "text-emerald-500" : ""}
											/>
											<span>{copied ? "Copied" : "Copy summary"}</span>
										</Button.Root>
									</div>
								</div>
								{result.age.ageDays !== null && (
									<div className="mt-6 rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-4 shadow-xs dark:border-white/10 dark:bg-[#0b0b0b]">
										<div className="mb-2 flex items-center justify-between font-mono text-[11px] text-text-sub-600 uppercase tracking-wider dark:text-white/40">
											<span>Domain Warmup Stages</span>
											<span>Current Age: {result.age.ageDays}d</span>
										</div>
										<div className="relative h-2.5 w-full overflow-hidden rounded-full bg-bg-weak-50 dark:bg-white/10">
											<div className="grid h-full grid-cols-4 divide-x divide-white/20 dark:divide-black/20">
												<div className="bg-rose-500/70" />
												<div className="bg-amber-500/70" />
												<div className="bg-blue-500/70" />
												<div className="bg-emerald-500/70" />
											</div>
											<div
												className="-ml-1 absolute top-0 bottom-0 w-2.5 rounded-full bg-text-strong-950 shadow-md ring-2 ring-white dark:bg-white dark:ring-black"
												style={{
													left: `${getTimelineProgress(result.age.ageDays)}%`,
												}}
											/>
										</div>
										<div className="mt-2.5 grid grid-cols-4 text-center font-mono text-[10.5px] text-text-sub-600 dark:text-white/50">
											<div
												className={
													result.verdict === "too_new"
														? "font-semibold text-rose-500"
														: ""
												}
											>
												Too New (0–7d)
											</div>
											<div
												className={
													result.verdict === "cold"
														? "font-semibold text-amber-500"
														: ""
												}
											>
												Cold (8–30d)
											</div>
											<div
												className={
													result.verdict === "warming"
														? "font-semibold text-blue-500"
														: ""
												}
											>
												Warming (31–90d)
											</div>
											<div
												className={
													result.verdict === "established" ||
													result.verdict === "mature"
														? "font-semibold text-emerald-500"
														: ""
												}
											>
												Established (90d+)
											</div>
										</div>
									</div>
								)}
							</div>
						</div>
					) : null}
				</MorphSlot>
			</form>
		</div>
	);
}
