"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { type FormEvent, useEffect, useId, useRef, useState } from "react";
import { CheckRequestError, runCheck } from "./check-api";
import { WindowDots } from "./grid";
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
	{ icon: string; badge: string; accent: string; label: string }
> = {
	disposable: {
		icon: "shield-cross",
		badge: "bg-error-lighter text-error-base",
		accent: "bg-error-base",
		label: "Disposable",
	},
	risky: {
		icon: "alert-triangle",
		badge: "bg-warning-lighter text-warning-base",
		accent: "bg-warning-base",
		label: "Needs a look",
	},
	deliverable: {
		icon: "shield-check",
		badge: "bg-success-lighter text-success-base",
		accent: "bg-success-base",
		label: "Not listed",
	},
	invalid: {
		icon: "cross-circle",
		badge: "bg-bg-weak-50 text-text-sub-600 dark:bg-white/5 dark:text-white/50",
		accent: "bg-stroke-soft-200 dark:bg-white/20",
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
		<li className="flex items-start gap-3 border-stroke-soft-200 border-t px-5 py-4 sm:px-6 dark:border-white/10">
			<Icon
				name={style.icon}
				className={cn("mt-0.5 size-4 shrink-0", style.tone)}
			/>
			<div className="min-w-0 flex-1">
				<p className="font-mono text-[11px] text-text-soft-400 uppercase tracking-[0.14em] dark:text-white/30">
					{label}
				</p>
				<p className="mt-1 break-words text-[14px] text-text-sub-600 leading-relaxed dark:text-white/55">
					{detail}
				</p>
			</div>
		</li>
	);
}

function ResultCard({ result }: { result: CheckResult }) {
	const style = VERDICT_STYLES[result.verdict];

	return (
		<div className="mt-4 overflow-hidden rounded-2xl border border-stroke-soft-200 bg-bg-white-0 dark:border-white/10 dark:bg-[#0b0b0b]">
			<span className={cn("block h-0.5 w-full", style.accent)} />

			<div className="flex items-center gap-3 border-stroke-soft-200 border-b px-5 py-3 sm:px-6 dark:border-white/10">
				<WindowDots />
				<span className="ml-auto min-w-0 truncate font-mono text-[12px] text-text-soft-400 dark:text-white/35">
					{result.input}
				</span>
			</div>

			<div className="px-5 py-5 sm:px-6">
				<div className="flex flex-wrap items-center gap-2.5">
					<span
						className={cn(
							"flex size-8 shrink-0 items-center justify-center rounded-full",
							style.badge,
						)}
					>
						<Icon name={style.icon} className="size-4" />
					</span>
					<h3 className="font-semibold text-[17px] text-text-strong-950 tracking-tight dark:text-white">
						{result.headline}
					</h3>
					<span
						className={cn(
							"rounded-full px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em]",
							style.badge,
						)}
					>
						{style.label}
					</span>
				</div>
				<p className="mt-3.5 text-[14px] text-text-sub-600 leading-relaxed sm:text-[15px] dark:text-white/50">
					{result.summary}
				</p>
			</div>

			<ul>
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

	const canSubmit = value.trim().length > 0 && !isPending;

	return (
		<div className="mx-auto w-full max-w-2xl">
			<form onSubmit={onSubmit} noValidate>
				<label htmlFor={inputId} className="sr-only">
					Email address or domain to check
				</label>

				<div className="overflow-hidden rounded-2xl border border-stroke-soft-200 bg-bg-white-0 shadow-[0_24px_60px_-40px_rgba(14,18,27,0.35)] transition-colors focus-within:border-primary-base/40 dark:border-white/12 dark:bg-[#0b0b0b] dark:shadow-none dark:focus-within:border-primary-base/50">
					<div className="flex items-center gap-3 px-5 pt-4 pb-3">
						<Icon
							name="at-sign"
							className="size-[18px] shrink-0 text-text-soft-400 dark:text-white/30"
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
							className="h-8 w-full min-w-0 bg-transparent text-[16px] text-text-strong-950 outline-none placeholder:text-text-soft-400 dark:text-white dark:placeholder:text-white/25"
						/>
					</div>

					<div className="flex items-center gap-3 border-stroke-soft-200 border-t px-3 py-3 dark:border-white/10">
						<div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto">
							{EXAMPLES.map((example) => (
								<button
									key={example}
									type="button"
									onClick={() => onExample(example)}
									disabled={isPending}
									className={cn(
										"shrink-0 rounded-lg px-2.5 py-1.5 font-mono text-[11.5px] transition-colors disabled:opacity-40",
										example === value
											? "bg-primary-base/10 text-primary-base"
											: "text-text-soft-400 hover:bg-bg-weak-50 hover:text-text-sub-600 dark:text-white/30 dark:hover:bg-white/5 dark:hover:text-white/60",
									)}
								>
									{example}
								</button>
							))}
						</div>

						<button
							type="submit"
							aria-label="Check address"
							disabled={!canSubmit}
							className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-base text-white transition-opacity hover:opacity-90 disabled:opacity-30"
						>
							{isPending ? (
								<span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
							) : (
								<Icon name="arrow-right" className="size-4" />
							)}
						</button>
					</div>
				</div>
			</form>

			<div aria-live="polite">
				{error ? (
					<div className="mt-4 flex items-start gap-3 rounded-2xl border border-stroke-soft-200 bg-bg-white-0 px-5 py-4 dark:border-white/10 dark:bg-[#0b0b0b]">
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
					<p className="mt-4 text-center font-mono text-[11px] text-text-soft-400 uppercase tracking-[0.14em] dark:text-white/25">
						Free · no account · addresses are discarded
					</p>
				)}
			</div>
		</div>
	);
}
