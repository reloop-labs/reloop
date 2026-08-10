import { toast } from "@reloop/ui/toast";
import axios from "axios";
import { toast as sonnerToast } from "sonner";

export const RATE_LIMIT_TOAST_ID = "rate-limit-countdown";

const DEFAULT_RATE_LIMIT_MESSAGE = "Too many requests";

type RateLimitInfo = {
	retryAfter: number;
	message: string;
};

let countdownTimer: ReturnType<typeof setInterval> | null = null;
let countdownActiveUntil = 0;

export function isRateLimitCountdownActive(): boolean {
	return Date.now() < countdownActiveUntil;
}

function headerValue(
	headers: Record<string, unknown> | undefined,
	name: string,
): string | undefined {
	if (!headers) return undefined;
	const lower = name.toLowerCase();
	for (const [key, value] of Object.entries(headers)) {
		if (key.toLowerCase() === lower && value != null) {
			return String(value);
		}
	}
	return undefined;
}

function parsePositiveSeconds(value: unknown): number | null {
	const n =
		typeof value === "number"
			? value
			: Number.parseInt(String(value ?? ""), 10);
	if (!Number.isFinite(n) || n <= 0) return null;
	return Math.max(1, Math.ceil(n));
}

/**
 * Extract retry-after seconds + message from axios / Better Auth style errors.
 */
export function getRateLimitInfo(error: unknown): RateLimitInfo | null {
	if (!error || typeof error !== "object") return null;

	const err = error as {
		status?: number;
		statusCode?: number;
		message?: string;
		response?: {
			status?: number;
			data?: {
				message?: string;
				fix?: string;
				retryAfter?: number;
				why?: string;
			};
			headers?: Record<string, unknown>;
		};
	};

	const status =
		err.response?.status ?? err.status ?? err.statusCode ?? undefined;
	if (status !== 429) return null;

	const data = err.response?.data;
	const fromBody = parsePositiveSeconds(data?.retryAfter);
	const fromHeader =
		parsePositiveSeconds(headerValue(err.response?.headers, "retry-after")) ??
		parsePositiveSeconds(headerValue(err.response?.headers, "x-retry-after")) ??
		parsePositiveSeconds(headerValue(err.response?.headers, "ratelimit-reset"));

	const fromMessage = err.message?.match(/(\d+)\s*second/i)?.[1];
	const fromFix = data?.fix?.match(/(\d+)\s*second/i)?.[1];

	const retryAfter =
		fromBody ??
		fromHeader ??
		parsePositiveSeconds(fromMessage) ??
		parsePositiveSeconds(fromFix) ??
		60;

	const message = data?.message || err.message || DEFAULT_RATE_LIMIT_MESSAGE;

	return { retryAfter, message };
}

function formatCountdownMessage(baseMessage: string, seconds: number): string {
	const base = baseMessage.replace(/\.\s*$/, "");
	return `${base}. Try again in ${seconds}s`;
}

/**
 * Live countdown toast for rate-limited (429) responses.
 * Uses a stable id so duplicate toasts collapse into one.
 */
export function showRateLimitCountdownToast(
	info: RateLimitInfo,
	options?: { toastId?: string | number },
): void {
	const toastId = options?.toastId ?? RATE_LIMIT_TOAST_ID;
	let remaining = info.retryAfter;

	if (countdownTimer) {
		clearInterval(countdownTimer);
		countdownTimer = null;
	}

	countdownActiveUntil = Date.now() + remaining * 1000 + 500;

	const tick = () => {
		toast.error(formatCountdownMessage(info.message, remaining), {
			id: toastId,
			duration: Math.max(1500, remaining * 1000 + 500),
		});
	};

	tick();

	countdownTimer = setInterval(() => {
		remaining -= 1;
		if (remaining <= 0) {
			if (countdownTimer) clearInterval(countdownTimer);
			countdownTimer = null;
			countdownActiveUntil = 0;
			toast.dismiss(toastId);
			return;
		}
		tick();
	}, 1000);
}

/** Show countdown when `error` is a 429; returns true if handled. */
export function toastRateLimitIfNeeded(error: unknown): boolean {
	const info = getRateLimitInfo(error);
	if (!info) return false;
	showRateLimitCountdownToast(info);
	return true;
}

/**
 * Prefer this over `toast.error` for API failures — rate limits get a countdown.
 */
export function toastApiError(
	error: unknown,
	fallback = "Something went wrong",
): void {
	if (toastRateLimitIfNeeded(error)) return;

	if (axios.isAxiosError(error)) {
		const message =
			(typeof error.response?.data?.message === "string" &&
				error.response.data.message) ||
			error.message ||
			fallback;
		toast.error(message);
		return;
	}

	if (error instanceof Error && error.message) {
		toast.error(error.message);
		return;
	}

	toast.error(fallback);
}

let interceptorInstalled = false;

/**
 * Show a countdown toast for every Axios 429. Safe to call once from providers.
 * Call-site `toast.error("Too many requests")` is suppressed while countdown runs.
 */
export function installAxiosRateLimitInterceptor(): void {
	if (interceptorInstalled || typeof window === "undefined") return;
	interceptorInstalled = true;

	axios.interceptors.response.use(
		(response) => response,
		(error: unknown) => {
			toastRateLimitIfNeeded(error);
			return Promise.reject(error);
		},
	);

	const patchToastError = (toastApi: { error: typeof toast.error }) => {
		const originalError = toastApi.error.bind(toastApi);
		toastApi.error = ((
			message: unknown,
			data?: Parameters<typeof toast.error>[1],
		) => {
			if (
				typeof message === "string" &&
				/too many requests/i.test(message) &&
				isRateLimitCountdownActive()
			) {
				return RATE_LIMIT_TOAST_ID;
			}
			return originalError(message as never, data);
		}) as typeof toast.error;
	};

	// Cover both @reloop/ui/toast and direct sonner imports.
	patchToastError(toast);
	patchToastError(sonnerToast);
}
