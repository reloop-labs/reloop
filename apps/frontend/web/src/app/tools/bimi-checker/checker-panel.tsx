"use client";

import * as Alert from "@reloop/ui/alert";
import * as Badge from "@reloop/ui/badge";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import Spinner from "@reloop/ui/spinner";
import { type FormEvent, useEffect, useRef, useState } from "react";
import {
	type BimiCheckResponse,
	type CheckStatus,
	runBimiCheck,
} from "./check-api";

const PRESETS = [
	{ label: "paypal.com", value: "paypal.com" },
	{ label: "linkedin.com", value: "linkedin.com" },
	{ label: "example.com", value: "example.com" },
	{ label: "reloop.sh", value: "reloop.sh" },
];

function verdictCopy(verdict: CheckStatus): {
	title: string;
	badge: "green" | "orange" | "red";
	icon: "shield-check" | "alert-triangle" | "alert-circle";
} {
	if (verdict === "pass") {
		return {
			title: "BIMI looks ready",
			badge: "green",
			icon: "shield-check",
		};
	}
	if (verdict === "warn") {
		return {
			title: "BIMI is present with warnings",
			badge: "orange",
			icon: "alert-circle",
		};
	}
	return {
		title: "BIMI is not ready",
		badge: "red",
		icon: "alert-triangle",
	};
}

function statusTone(status: CheckStatus): string {
	if (status === "pass") {
		return "bg-success-lighter text-success-base dark:bg-emerald-500/10 dark:text-emerald-400";
	}
	if (status === "warn") {
		return "bg-warning-lighter text-warning-base dark:bg-amber-500/10 dark:text-amber-400";
	}
	return "bg-error-lighter text-error-base dark:bg-rose-500/10 dark:text-rose-400";
}

function isPreviewableLogoUrl(url: string | null): url is string {
	if (!url) return false;
	try {
		return new URL(url).protocol === "https:";
	} catch {
		return false;
	}
}

function LogoPreview({ url, domain }: { url: string; domain: string }) {
	const [failed, setFailed] = useState(false);

	useEffect(() => {
		setFailed(false);
	}, [url]);

	return (
		<div className="shrink-0 text-center">
			<div className="flex size-20 items-center justify-center overflow-hidden rounded-2xl border border-stroke-soft-200 bg-white p-2 dark:border-white/10">
				{failed ? (
					<p className="px-1 font-mono text-[10px] text-text-sub-600 leading-snug dark:text-black/55">
						Preview failed
					</p>
				) : (
					<img
						src={url}
						alt={`BIMI logo for ${domain}`}
						className="size-full object-contain"
						referrerPolicy="no-referrer"
						onError={() => setFailed(true)}
					/>
				)}
			</div>
			<p className="mt-1.5 font-mono text-[10px] text-text-sub-600 uppercase tracking-wider dark:text-white/40">
				Published logo
			</p>
		</div>
	);
}

export function CheckerPanel() {
	const [input, setInput] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [result, setResult] = useState<BimiCheckResponse | null>(null);
	const [error, setError] = useState<string | null>(null);
	const abortRef = useRef<AbortController | null>(null);

	const executeCheck = async (domainValue: string) => {
		const domain = domainValue.trim();
		if (!domain) return;

		abortRef.current?.abort();
		const controller = new AbortController();
		abortRef.current = controller;

		setIsLoading(true);
		setError(null);

		try {
			const res = await runBimiCheck(domain, controller.signal);
			setResult(res);
		} catch (err) {
			if (err instanceof DOMException && err.name === "AbortError") return;
			setResult(null);
			setError(
				(err as Error).message ||
					"Failed to look up BIMI. Check your connection.",
			);
		} finally {
			if (!controller.signal.aborted) setIsLoading(false);
		}
	};

	useEffect(() => {
		return () => abortRef.current?.abort();
	}, []);

	const handleSubmit = (e: FormEvent) => {
		e.preventDefault();
		executeCheck(input);
	};

	const headline = result ? verdictCopy(result.verdict) : null;

	return (
		<div className="mx-auto max-w-5xl">
			<div className="rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-4 shadow-xs sm:p-5 dark:border-white/10 dark:bg-[#0b0b0b]">
				<form
					onSubmit={handleSubmit}
					className="flex flex-col gap-2.5 sm:flex-row sm:items-center"
				>
					<Input.Root size="small" className="flex-1">
						<Input.Wrapper>
							<Input.Input
								value={input}
								onChange={(e) => setInput(e.target.value)}
								placeholder="example.com"
								disabled={isLoading}
								autoComplete="off"
								spellCheck={false}
								aria-label="Domain to check"
							/>
						</Input.Wrapper>
					</Input.Root>

					<FancyButton.Root
						type="submit"
						variant="primary"
						size="small"
						disabled={isLoading || !input.trim()}
					>
						{isLoading ? (
							<>
								<Spinner size={18} />
								<span>Checking…</span>
							</>
						) : (
							<>
								<FancyButton.Icon>
									<Icon name="search" className="size-4" />
								</FancyButton.Icon>
								<span>Check BIMI</span>
							</>
						)}
					</FancyButton.Root>
				</form>

				<div className="mt-3.5 flex flex-wrap items-center gap-1.5 text-[12px] text-text-sub-600 dark:text-white/45">
					<span className="mr-1 font-mono text-[11px] uppercase tracking-wider">
						Try sample:
					</span>
					{PRESETS.map((preset) => (
						<Button.Root
							key={preset.value}
							type="button"
							variant="neutral"
							mode={input === preset.value ? "filled" : "stroke"}
							size="xxsmall"
							onClick={() => {
								setInput(preset.value);
								executeCheck(preset.value);
							}}
							className="font-mono"
						>
							{preset.label}
						</Button.Root>
					))}
				</div>
			</div>

			{error && (
				<Alert.Root
					variant="lighter"
					status="error"
					size="large"
					className="mt-6"
				>
					<Alert.Icon as={Icon} name="alert-triangle" />
					<div>
						<div className="font-medium text-label-sm">Lookup error</div>
						<p className="mt-0.5 text-paragraph-sm">{error}</p>
					</div>
				</Alert.Root>
			)}

			{result && headline && !error && (
				<div className="mt-4 space-y-3.5">
					<div className="overflow-hidden rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-5 shadow-xs sm:p-6 dark:border-white/10 dark:bg-[#0b0b0b]">
						<div className="flex flex-wrap items-start gap-3.5">
							<div
								className={cn(
									"flex size-11 shrink-0 items-center justify-center rounded-2xl",
									statusTone(result.verdict),
								)}
							>
								<Icon name={headline.icon} className="size-5" />
							</div>
							<div className="min-w-0 flex-1">
								<div className="flex flex-wrap items-center gap-2">
									<h2 className="font-semibold text-[18px] text-text-strong-950 dark:text-white">
										{headline.title}
									</h2>
									<Badge.Root color={headline.badge} variant="lighter">
										{result.verdict}
									</Badge.Root>
								</div>
								<p className="mt-1 font-mono text-[13px] text-text-sub-600 dark:text-white/50">
									{result.queryName}
								</p>
							</div>
							{isPreviewableLogoUrl(result.logoUrl) && (
								<LogoPreview url={result.logoUrl} domain={result.domain} />
							)}
						</div>

						<ul className="mt-5 divide-y divide-stroke-soft-200 dark:divide-white/10">
							{result.checks.map((check) => (
								<li key={check.id} className="py-3 first:pt-0 last:pb-0">
									<div className="flex items-start gap-3">
										<span
											className={cn(
												"mt-0.5 inline-flex rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider",
												statusTone(check.status),
											)}
										>
											{check.status}
										</span>
										<div className="min-w-0 flex-1">
											<p className="font-medium text-[14px] text-text-strong-950 dark:text-white">
												{check.label}
											</p>
											<p className="mt-0.5 text-[13px] text-text-sub-600 dark:text-white/55">
												{check.detail}
											</p>
											{check.record && (
												<code className="mt-2 block overflow-x-auto rounded-lg bg-bg-weak-50 p-2 font-mono text-[12px] dark:bg-black">
													{check.record}
												</code>
											)}
											{check.fix && check.status !== "pass" && (
												<p className="mt-1.5 text-[13px] text-text-strong-950 dark:text-white/70">
													Fix: {check.fix}
												</p>
											)}
										</div>
									</div>
								</li>
							))}
						</ul>
					</div>
				</div>
			)}
		</div>
	);
}
