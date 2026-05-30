"use client";

import * as Alert from "@reloop/ui/alert";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";

interface DiagnosticCardProps {
	log: {
		level: string;
		status_code?: number | null;
		metadata?: Record<string, unknown>;
		event?: string;
	};
}

export interface LogDiagnostic {
	why: string;
	fix: string;
	link?: string;
}

export function getLogDiagnostics(log: {
	level: string;
	status_code?: number | null;
	metadata?: Record<string, unknown>;
	event?: string;
}): LogDiagnostic | null {
	// If it is a success status, don't show any diagnostic cards
	const status = log.status_code;
	const level = log.level?.toLowerCase() || "";
	if (
		status &&
		status >= 200 &&
		status < 400 &&
		level !== "error" &&
		level !== "warn"
	) {
		return null;
	}

	const meta = log.metadata || {};

	// 1. Direct match in metadata
	if (typeof meta.why === "string" && typeof meta.fix === "string") {
		return {
			why: meta.why,
			fix: meta.fix,
			link: typeof meta.link === "string" ? meta.link : undefined,
		};
	}

	// 2. Match in nested error object
	if (meta.error && typeof meta.error === "object" && meta.error !== null) {
		const errObj = meta.error as Record<string, unknown>;
		if (typeof errObj.why === "string" && typeof errObj.fix === "string") {
			return {
				why: errObj.why,
				fix: errObj.fix,
				link: typeof errObj.link === "string" ? errObj.link : undefined,
			};
		}
	}

	// 3. Match in stringified JSON error
	if (typeof meta.error === "string") {
		try {
			const parsed = JSON.parse(meta.error);
			if (parsed && typeof parsed === "object") {
				if (typeof parsed.why === "string" && typeof parsed.fix === "string") {
					return {
						why: parsed.why,
						fix: parsed.fix,
						link: typeof parsed.link === "string" ? parsed.link : undefined,
					};
				}
			}
		} catch {
			// Not a JSON string
		}
	}

	// 4. Fallback mappings based on status and event names
	const eventName = log.event || "";
	if (
		status === 401 ||
		status === 403 ||
		eventName.includes("unauthorized") ||
		eventName.includes("auth_failed")
	) {
		return {
			why: "The request could not be authenticated due to missing, invalid, or expired credentials.",
			fix: "Check your Authorization header, verify that the API key is active, and try again.",
			link: "https://docs.reloop.co/errors/unauthorized",
		};
	}

	// Rate limit check
	if (
		status === 429 ||
		eventName.includes("rate_limited") ||
		eventName.includes("rate-limit")
	) {
		return {
			why: "Too many requests were sent in a short period, exceeding the rate limits allowed for this endpoint.",
			fix: "Reduce request frequency, implement backoff/retry strategies, or upgrade your plan to increase limits.",
			link: "https://docs.reloop.co/errors/rate-limits",
		};
	}

	if (status === 404 || eventName.includes("not_found")) {
		return {
			why: "The requested log, email log, or API key resource does not exist or has been deleted.",
			fix: "Verify the resource ID is correct and ensure you have selected the appropriate organization context.",
		};
	}

	if (
		status === 400 ||
		eventName.includes("bad_request") ||
		eventName.includes("failed")
	) {
		const msg =
			typeof meta.error === "string"
				? meta.error
				: typeof meta.message === "string"
					? meta.message
					: "The server could not process the request because it was invalid or malformed.";
		return {
			why: msg,
			fix: "Verify your request payload parameters against the API schema documentation and try again.",
		};
	}

	// General level fallback
	if (level === "error" || level === "fatal") {
		const msg =
			typeof meta.error === "string"
				? meta.error
				: typeof meta.message === "string"
					? meta.message
					: "An unexpected error occurred during execution.";
		return {
			why: msg,
			fix: "Check the service status and try again. If the issue persists, contact Reloop support.",
		};
	}

	return null;
}

export const DiagnosticCard = ({ log }: DiagnosticCardProps) => {
	const diagnostics = getLogDiagnostics(log);
	if (!diagnostics) return null;

	const isWarn = log.level?.toLowerCase() === "warn" || log.status_code === 429;

	return (
		<Alert.Root
			variant="lighter"
			status={isWarn ? "warning" : "error"}
			size="large"
			className={cn(
				"relative overflow-hidden rounded-xl border p-4.5 shadow-sm transition-all duration-300",
				isWarn
					? "border-warning-light text-text-strong-950"
					: "border-error-light text-text-strong-950",
			)}
		>
			{/* Diagonal background accent for premium touch */}
			<div className="-mr-6 -mt-6 pointer-events-none absolute top-0 right-0 h-24 w-24 rounded-full bg-current opacity-10" />

			<div className="flex gap-3">
				<div className="flex-shrink-0">
					<div
						className={cn(
							"flex h-8 w-8 items-center justify-center rounded-lg border shadow-sm",
							isWarn
								? "border-warning-light/30 bg-warning-base/10 text-warning-base"
								: "border-error-light/30 bg-error-base/10 text-error-base",
						)}
					>
						<Icon
							name={isWarn ? "alert-triangle" : "alert-circle"}
							className="h-4.5 w-4.5"
						/>
					</div>
				</div>

				<div className="flex-1 space-y-3.5">
					<div className="space-y-1">
						<h4 className="font-semibold text-text-strong-950 text-xs uppercase tracking-wider">
							Diagnostic Report
						</h4>
						<p className="text-paragraph-xs text-text-sub-600">
							Reloop AI detected a potential issue with this request.
						</p>
					</div>

					<div className="grid gap-3 sm:grid-cols-2">
						{/* Why section */}
						<div className="space-y-1">
							<span className="font-medium text-[10px] text-text-sub-600 uppercase tracking-wider">
								The Issue
							</span>
							<p className="font-medium text-paragraph-xs text-text-strong-950">
								{diagnostics.why}
							</p>
						</div>

						{/* Fix section */}
						<div className="space-y-1">
							<span className="font-medium text-[10px] text-text-sub-600 uppercase tracking-wider">
								How to Fix
							</span>
							<p className="font-medium text-paragraph-xs text-text-strong-950">
								{diagnostics.fix}
							</p>
						</div>
					</div>

					{/* Action documentation link */}
					{diagnostics.link && (
						<div className="pt-1">
							<a
								href={diagnostics.link}
								target="_blank"
								rel="noreferrer"
								className={cn(
									"inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-medium text-xs shadow-sm transition-all duration-200",
									isWarn
										? "border-warning-light/50 bg-bg-white-0 text-warning-base hover:bg-warning-base/10"
										: "border-error-light/50 bg-bg-white-0 text-error-base hover:bg-error-base/10",
								)}
							>
								Troubleshooting Docs
								<Icon name="link" className="h-3 w-3" />
							</a>
						</div>
					)}
				</div>
			</div>
		</Alert.Root>
	);
};
