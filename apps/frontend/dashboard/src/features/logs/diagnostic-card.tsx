import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";

type DiagnosticLog = {
	level: string;
	status_code?: number | null;
	metadata?: Record<string, unknown>;
	event?: string;
};

interface DiagnosticCardProps {
	log: DiagnosticLog;
	className?: string;
}

export interface LogDiagnostic {
	/** Short headline, usually the API's own error message. */
	title: string;
	why: string;
	fix: string;
	link?: string;
}

/** Older logs stored `String(response)`, so ignore stringified empties. */
const JUNK_STRINGS = new Set(["undefined", "null", "[object object]"]);

const str = (v: unknown): string | undefined => {
	if (typeof v !== "string") return undefined;
	const t = v.trim();
	return t && !JUNK_STRINGS.has(t.toLowerCase()) ? t : undefined;
};

/** Pulls `message` / `why` / `fix` / `link` out of the many shapes metadata takes. */
function readErrorFields(meta: Record<string, unknown>) {
	const sources: Record<string, unknown>[] = [meta];
	if (meta.error && typeof meta.error === "object") {
		sources.push(meta.error as Record<string, unknown>);
	}
	if (typeof meta.error === "string") {
		try {
			const parsed = JSON.parse(meta.error);
			if (parsed && typeof parsed === "object") sources.push(parsed);
		} catch {
			// Plain message string, handled below.
		}
	}

	const pick = (key: string) => {
		for (const s of sources) {
			const v = str(s[key]);
			if (v) return v;
		}
		return undefined;
	};

	const rawError = str(meta.error);
	const message =
		pick("message") ??
		(rawError && !rawError.startsWith("{") ? rawError : undefined);

	return { message, why: pick("why"), fix: pick("fix"), link: pick("link") };
}

/** Generic guidance by status class, used only when the API gave none. */
function fallbackFor(
	status: number | null | undefined,
	eventName: string,
): { title: string; why: string; fix: string } {
	if (
		status === 401 ||
		eventName.includes("unauthorized") ||
		eventName.includes("auth_failed")
	) {
		return {
			title: "Unauthorized",
			why: "The request could not be authenticated: the API key is missing, invalid, or revoked.",
			fix: "Send a valid API key in the Authorization header and make sure the key is still active.",
		};
	}
	if (status === 403) {
		return {
			title: "Forbidden",
			why: "The credentials are valid but don't have permission for this action.",
			fix: "Use a key with the required permissions, or check that the resource belongs to this organization.",
		};
	}
	if (status === 402) {
		return {
			title: "Payment required",
			why: "Your plan's sending limit or credits don't cover this request.",
			fix: "Upgrade your plan or wait for the quota to reset, then try again.",
		};
	}
	if (
		status === 429 ||
		eventName.includes("rate_limited") ||
		eventName.includes("rate-limit")
	) {
		return {
			title: "Rate limited",
			why: "Too many requests were sent in a short period for this endpoint.",
			fix: "Slow down and retry with exponential backoff.",
		};
	}
	if (status === 404 || eventName.includes("not_found")) {
		return {
			title: "Not found",
			why: "Something referenced in this request doesn't exist in this organization.",
			fix: "Check the IDs and names in the request body (domain, template, contact, etc.) and that they belong to this organization.",
		};
	}
	if (status === 413) {
		return {
			title: "Payload too large",
			why: "The request body exceeded the size limit.",
			fix: "Reduce attachment or HTML size and send again.",
		};
	}
	if (status && status >= 500) {
		return {
			title: "Server error",
			why: "Reloop hit an unexpected error while handling this request.",
			fix: "Retry the request. If it keeps failing, contact support with the request ID.",
		};
	}
	return {
		title: "Invalid request",
		why: "The request was rejected because it was invalid or malformed.",
		fix: "Check the request body against the API reference and try again.",
	};
}

export function getLogDiagnostics(log: DiagnosticLog): LogDiagnostic | null {
	const status = log.status_code;
	const level = log.level?.toLowerCase() || "";
	const isProblem =
		(status != null && status >= 400) ||
		level === "error" ||
		level === "fatal" ||
		level === "warn";
	if (!isProblem) return null;

	const { message, why, fix, link } = readErrorFields(log.metadata || {});
	const fallback = fallbackFor(status, log.event || "");

	return {
		title: message ?? fallback.title,
		// Prefer the API's explanation; the bare message is next best.
		why:
			why ?? (message && message !== fallback.title ? message : fallback.why),
		fix: fix ?? fallback.fix,
		link,
	};
}

export const DiagnosticCard = ({ log, className }: DiagnosticCardProps) => {
	const diagnostics = getLogDiagnostics(log);
	if (!diagnostics) return null;

	const isWarn = log.level?.toLowerCase() === "warn" || log.status_code === 429;
	const showWhy =
		diagnostics.why.toLowerCase() !== diagnostics.title.toLowerCase();

	return (
		<div
			className={cn(
				"rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-1 dark:border-stroke-soft-100/40 dark:bg-white/[0.02]",
				className,
			)}
		>
			<div className="flex items-start gap-3 px-3.5 pt-3 pb-3.5">
				<span
					className={cn(
						"mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full",
						isWarn
							? "bg-warning-base/12 text-warning-base"
							: "bg-error-base/12 text-error-base",
					)}
				>
					<Icon name={isWarn ? "alert" : "alert-circle"} className="size-3.5" />
				</span>
				<div className="min-w-0 flex-1">
					<div className="flex items-center gap-2">
						<p className="min-w-0 font-medium text-paragraph-sm text-text-strong-950">
							{diagnostics.title}
						</p>
						{log.status_code ? (
							<span className="shrink-0 rounded-md bg-bg-weak-50 px-1.5 py-0.5 font-mono text-[11px] text-text-sub-600 dark:bg-white/5">
								{log.status_code}
							</span>
						) : null}
					</div>
					{showWhy && (
						<p className="mt-1 text-paragraph-sm text-text-sub-600">
							{diagnostics.why}
						</p>
					)}
				</div>
			</div>

			<div className="flex items-start gap-3 rounded-xl bg-bg-weak-50 px-3.5 py-3 dark:bg-white/[0.04]">
				<Icon
					name="bulb"
					className="mt-0.5 size-4 shrink-0 text-text-sub-600"
				/>
				<div className="min-w-0 flex-1">
					<p className="font-medium text-[11px] text-text-soft-400 uppercase tracking-wider">
						How to fix
					</p>
					<p className="mt-0.5 text-paragraph-sm text-text-strong-950">
						{diagnostics.fix}
					</p>
					{diagnostics.link && (
						<a
							href={diagnostics.link}
							target="_blank"
							rel="noreferrer"
							className="mt-2 inline-flex items-center gap-1 font-medium text-text-strong-950 text-xs underline decoration-dotted underline-offset-2 hover:text-text-sub-600"
						>
							Read the docs
							<Icon name="external-link" className="size-3" />
						</a>
					)}
				</div>
			</div>
		</div>
	);
};
