"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { type FormEvent, useEffect, useId, useRef, useState } from "react";
import { CheckRequestError, runCheck } from "./check-api";
import {
	type CheckResult,
	type CheckVerdict,
	type SignalStatus,
	toCheckResult,
} from "./presenter";

const EXAMPLES = [
	"you@mailinator.com",
	"info@acme.com",
	"hello@gmail.com",
	"tempmail.com",
];

const VERDICT_STYLES: Record<
	CheckVerdict,
	{ icon: string; badge: string; ring: string; label: string }
> = {
	disposable: {
		icon: "shield-cross",
		badge: "bg-error-lighter text-error-base",
		ring: "ring-error-base/25",
		label: "Disposable",
	},
	risky: {
		icon: "alert-triangle",
		badge: "bg-warning-lighter text-warning-base",
		ring: "ring-warning-base/25",
		label: "Needs a look",
	},
	deliverable: {
		icon: "shield-check",
		badge: "bg-success-lighter text-success-base",
		ring: "ring-success-base/25",
		label: "Looks fine",
	},
	invalid: {
		icon: "cross-circle",
		badge: "bg-bg-weak-50 text-text-sub-600 dark:bg-white/5 dark:text-white/50",
		ring: "ring-stroke-soft-200 dark:ring-white/10",
		label: "Invalid",
	},
};

const SIGNAL_STYLES: Record<SignalStatus, { icon: string; tone: string }> = {
	pass: { icon: "check-circle", tone: "text-success-base" },
	fail: { icon: "cross-circle", tone: "text-error-base" },
	warn: { icon: "alert-triangle", tone: "text-warning-base" },
	neutral: {
		icon: "info-outline",
		tone: "text-text-soft-400 dark:text-white/35",
	},
};

function SignalRow({
	label,
	detail,
	status,
}: {
	label: string;
	detail: string;
	status: SignalStatus;
}) {
	const style = SIGNAL_STYLES[status];

	return (
		<li className="flex items-start gap-3 py-3.5 first:pt-0 last:pb-0">
			<Icon
				name={style.icon}
				className={cn("mt-0.5 size-4 shrink-0", style.tone)}
			/>
			<div className="min-w-0 flex-1">
				<p className="font-medium text-[14px] text-text-strong-950 dark:text-white">
					{label}
				</p>
				<p className="mt-0.5 break-words text-[13px] text-text-sub-600 leading-relaxed dark:text-white/45">
					{detail}
				</p>
			</div>
		</li>
	);
}

function ResultCard({ result }: { result: CheckResult }) {
	const style = VERDICT_STYLES[result.verdict];

	return (
		<div
			className={cn(
				"mt-5 overflow-hidden rounded-2xl border border-stroke-soft-200 bg-bg-white-0 ring-4 dark:border-white/10 dark:bg-[#111]",
				style.ring,
			)}
		>
			<div className="flex flex-wrap items-start gap-4 border-stroke-soft-200 border-b px-5 py-5 sm:px-6 dark:border-white/10">
				<span
					className={cn(
						"flex size-10 shrink-0 items-center justify-center rounded-full",
						style.badge,
					)}
				>
					<Icon name={style.icon} className="size-5" />
				</span>
				<div className="min-w-0 flex-1">
					<div className="flex flex-wrap items-center gap-2">
						<h3 className="font-semibold text-[17px] text-text-strong-950 tracking-tight dark:text-white">
							{result.headline}
						</h3>
						<span
							className={cn(
								"rounded-full px-2 py-0.5 font-medium text-[11px] uppercase tracking-wide",
								style.badge,
							)}
						>
							{style.label}
						</span>
					</div>
					<p className="mt-0.5 break-all font-mono text-[13px] text-text-sub-600 dark:text-white/45">
						{result.input}
					</p>
				</div>
			</div>

			<div className="px-5 py-5 sm:px-6">
				<p className="text-[14px] text-text-sub-600 leading-relaxed sm:text-[15px] dark:text-white/50">
					{result.summary}
				</p>
				<ul className="mt-5 divide-y divide-stroke-soft-200 dark:divide-white/10">
					{result.signals.map((s) => (
						<SignalRow
							key={s.id}
							label={s.label}
							detail={s.detail}
							status={s.status}
						/>
					))}
				</ul>
			</div>
		</div>
	);
}

export function CheckerPanel() {
	const inputId = useId();
	const inputRef = useRef<HTMLInputElement>(null);
	const [value, setValue] = useState("");
	const [result, setResult] = useState<CheckResult | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [isPending, setIsPending] = useState(false);

	const requestRef = useRef<AbortController | null>(null);

	useEffect(() => () => requestRef.current?.abort(), []);

	const run = async (raw: string) => {
		if (!raw.trim()) {
			setResult(null);
			setError(null);
			return;
		}

		requestRef.current?.abort();
		const controller = new AbortController();
		requestRef.current = controller;

		setIsPending(true);
		setError(null);

		try {
			const response = await runCheck(raw, controller.signal);
			setResult(toCheckResult(response));
		} catch (err) {
			if (controller.signal.aborted) return;
			setResult(null);
			setError(
				err instanceof CheckRequestError
					? err.message
					: "Something went wrong running that check.",
			);
		} finally {
			if (!controller.signal.aborted) setIsPending(false);
		}
	};

	const onSubmit = (e: FormEvent) => {
		e.preventDefault();
		void run(value);
	};

	const onExample = (example: string) => {
		setValue(example);
		void run(example);
		inputRef.current?.focus();
	};

	return (
		<div className="mx-auto w-full max-w-2xl">
			<form onSubmit={onSubmit} noValidate>
				<label htmlFor={inputId} className="sr-only">
					Email address or domain to check
				</label>
				<div className="flex flex-col gap-2.5 sm:flex-row">
					<div className="group relative flex flex-1 items-center rounded-full border border-stroke-soft-200 bg-bg-white-0 transition-colors focus-within:border-text-strong-950 dark:border-white/12 dark:bg-[#111] dark:focus-within:border-white/40">
						<Icon
							name="at-sign"
							className="pointer-events-none absolute left-4 size-4 text-text-soft-400 dark:text-white/30"
						/>
						<input
							id={inputId}
							ref={inputRef}
							type="text"
							inputMode="email"
							autoComplete="off"
							autoCapitalize="none"
							spellCheck={false}
							value={value}
							onChange={(e) => setValue(e.target.value)}
							placeholder="you@example.com"
							className="h-12 w-full bg-transparent pr-4 pl-11 text-[15px] text-text-strong-950 outline-none placeholder:text-text-soft-400 dark:text-white dark:placeholder:text-white/30"
						/>
					</div>
					<button
						type="submit"
						className="inline-flex h-12 shrink-0 items-center justify-center rounded-full bg-text-strong-950 px-7 font-semibold text-[15px] text-bg-white-0 transition-opacity hover:opacity-90 disabled:opacity-40 dark:bg-white dark:text-black"
						disabled={value.trim().length === 0 || isPending}
					>
						{isPending ? "Checking…" : "Check address"}
					</button>
				</div>
			</form>

			<div className="mt-3.5 flex flex-wrap items-center justify-center gap-x-2 gap-y-2">
				<span className="text-[13px] text-text-soft-400 dark:text-white/30">
					Try:
				</span>
				{EXAMPLES.map((example) => (
					<button
						key={example}
						type="button"
						onClick={() => onExample(example)}
						disabled={isPending}
						className="rounded-full border border-stroke-soft-200 px-3 py-1 font-mono text-[12px] text-text-sub-600 transition-colors hover:border-text-strong-950/30 hover:text-text-strong-950 disabled:opacity-40 dark:border-white/10 dark:text-white/45 dark:hover:border-white/30 dark:hover:text-white"
					>
						{example}
					</button>
				))}
			</div>

			<div aria-live="polite">
				{error ? (
					<div className="mt-5 flex items-start gap-3 rounded-2xl border border-stroke-soft-200 bg-bg-white-0 px-5 py-4 dark:border-white/10 dark:bg-[#111]">
						<Icon
							name="alert-triangle"
							className="mt-0.5 size-4 shrink-0 text-warning-base"
						/>
						<p className="text-[14px] text-text-sub-600 leading-relaxed dark:text-white/50">
							{error}
						</p>
					</div>
				) : result ? (
					<ResultCard result={result} />
				) : (
					<p className="mt-6 text-center text-[13px] text-text-soft-400 dark:text-white/30">
						Free, no account needed. Addresses are checked and discarded.
					</p>
				)}
			</div>
		</div>
	);
}
