/**
 * One colour and icon per email status, used by every surface that shows a
 * status: tables, badges, the email page steps, timelines, drawers, cards and
 * campaign metrics, in the dashboard, console and marketing site.
 *
 * Keep these in sync by importing from here instead of hard-coding colours.
 * When the same status shows different colours on two screens, people start
 * wondering what the difference means.
 *
 *   sent      blue    send-1
 *   delivered green   check-circle
 *   opened    orange  mail-open
 *   clicked   purple  cursor-click
 *   failed    red     cross-circle  (also bounced, spam, complaint)
 *   pending   amber   clock         (queued, not yet sent)
 */

export type EmailStatusKey =
	| "sent"
	| "delivered"
	| "opened"
	| "clicked"
	| "failed"
	| "pending"
	| "unknown";

export type EmailStatusTone = {
	key: EmailStatusKey;
	label: string;
	/** Name in the @reloop/ui icon sprite. */
	icon: string;
	/** Text and icon colour, e.g. a status label in a table. */
	text: string;
	/** Filled pill: background + text. */
	badge: string;
	/** Tinted square behind an icon: border + background + icon colour. */
	box: string;
};

const TONES: Record<EmailStatusKey, EmailStatusTone> = {
	sent: {
		key: "sent",
		label: "Sent",
		icon: "send-1",
		text: "text-information-base",
		badge: "bg-information-lighter text-information-base",
		box: "border-information-base/20 bg-information-lighter/50 text-information-base",
	},
	delivered: {
		key: "delivered",
		label: "Delivered",
		icon: "check-circle",
		text: "text-success-base",
		badge: "bg-success-lighter text-success-base",
		box: "border-success-base/20 bg-success-lighter/50 text-success-base",
	},
	opened: {
		key: "opened",
		label: "Opened",
		icon: "mail-open",
		text: "text-orange-600 dark:text-orange-400",
		badge:
			"bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400",
		box: "border-orange-500/20 bg-orange-50/50 text-orange-600 dark:bg-orange-950/30 dark:text-orange-400",
	},
	clicked: {
		key: "clicked",
		label: "Clicked",
		icon: "cursor-click",
		text: "text-purple-600 dark:text-purple-400",
		badge:
			"bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400",
		box: "border-purple-500/20 bg-purple-50/50 text-purple-600 dark:bg-purple-950/30 dark:text-purple-400",
	},
	failed: {
		key: "failed",
		label: "Failed",
		icon: "cross-circle",
		text: "text-error-base",
		badge: "bg-error-lighter text-error-base",
		box: "border-error-light bg-error-lighter text-error-base",
	},
	pending: {
		key: "pending",
		label: "Pending",
		icon: "clock",
		text: "text-warning-base",
		badge: "bg-warning-lighter text-warning-base",
		box: "border-warning-base/20 bg-warning-lighter/50 text-warning-base",
	},
	unknown: {
		key: "unknown",
		label: "Unknown",
		icon: "mail-single",
		text: "text-text-sub-600",
		badge: "bg-bg-weak-50 text-text-sub-600",
		box: "border-stroke-soft-200 bg-bg-weak-50 text-text-sub-600",
	},
};

const ALIASES: Record<string, EmailStatusKey> = {
	sent: "sent",
	accepted: "sent",
	delivered: "delivered",
	opened: "opened",
	open: "opened",
	clicked: "clicked",
	click: "clicked",
	failed: "failed",
	bounced: "failed",
	bounce: "failed",
	spam: "failed",
	complaint: "failed",
	complained: "failed",
	rejected: "failed",
	pending: "pending",
	queued: "pending",
	scheduled: "pending",
	sending: "pending",
};

/** Colour, icon and label for an email status or event type. */
export function emailStatusTone(
	status: string | null | undefined,
): EmailStatusTone {
	const key = ALIASES[(status ?? "").toLowerCase()] ?? "unknown";
	const tone = TONES[key];
	// Keep the specific wording ("Bounced", "Spam") while sharing the colour.
	const raw = (status ?? "").trim();
	if (key === "failed" && raw) {
		return {
			...tone,
			label: raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase(),
		};
	}
	return tone;
}

export const EMAIL_STATUS_TONES = TONES;
