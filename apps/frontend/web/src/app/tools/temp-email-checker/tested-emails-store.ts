"use client";

import { useEffect, useState } from "react";

export type TestedEmailRecord = {
	id: string;
	email: string;
	domain: string;
	verdict: "disposable" | "deliverable" | "risky" | "invalid";
	isDisposable: boolean;
	isAllowlisted?: boolean;
	isRole?: boolean;
	summary: string;
	timestamp: number;
};

const STORAGE_KEY = "reloop_temp_email_history_v1";
export const CHECK_EVENT_NAME = "reloop_email_tested";

export const INITIAL_TESTED_EMAILS: TestedEmailRecord[] = [
	{
		id: "init-1",
		email: "koxow38027@prodbits.com",
		domain: "prodbits.com",
		verdict: "disposable",
		isDisposable: true,
		summary: "Domain matched exact entry in disposable domain catalogue.",
		timestamp: Date.now() - 1000 * 60 * 2,
	},
	{
		id: "init-2",
		email: "sarah.connor@gmail.com",
		domain: "gmail.com",
		verdict: "deliverable",
		isDisposable: false,
		summary: "Valid MX records with persistent consumer provider.",
		timestamp: Date.now() - 1000 * 60 * 14,
	},
	{
		id: "init-3",
		email: "support@stripe.com",
		domain: "stripe.com",
		verdict: "risky",
		isDisposable: false,
		isRole: true,
		summary: "Shared corporate role mailbox prefix (support@).",
		timestamp: Date.now() - 1000 * 60 * 35,
	},
	{
		id: "init-4",
		email: "tester@mailinator.com",
		domain: "mailinator.com",
		verdict: "disposable",
		isDisposable: true,
		summary: "Known public temporary burner service.",
		timestamp: Date.now() - 1000 * 60 * 75,
	},
	{
		id: "init-5",
		email: "alex@reloop.sh",
		domain: "reloop.sh",
		verdict: "deliverable",
		isDisposable: false,
		summary: "Legitimate custom domain with active MX infrastructure.",
		timestamp: Date.now() - 1000 * 60 * 120,
	},
];

export function getStoredTestedEmails(): TestedEmailRecord[] {
	if (typeof window === "undefined") return INITIAL_TESTED_EMAILS;
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return INITIAL_TESTED_EMAILS;
		const parsed = JSON.parse(raw);
		if (Array.isArray(parsed) && parsed.length > 0) return parsed;
		return INITIAL_TESTED_EMAILS;
	} catch {
		return INITIAL_TESTED_EMAILS;
	}
}

export function saveTestedEmail(
	record: Omit<TestedEmailRecord, "id" | "timestamp">,
): void {
	if (typeof window === "undefined") return;
	try {
		const current = getStoredTestedEmails();
		const filtered = current.filter(
			(item) => item.email.toLowerCase() !== record.email.toLowerCase(),
		);
		const newRecord: TestedEmailRecord = {
			...record,
			id: `test-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
			timestamp: Date.now(),
		};
		const updated = [newRecord, ...filtered].slice(0, 10);
		localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
		window.dispatchEvent(
			new CustomEvent(CHECK_EVENT_NAME, { detail: updated }),
		);
	} catch {
		// Ignore storage errors
	}
}

export function useTestedEmails() {
	const [list, setList] = useState<TestedEmailRecord[]>(INITIAL_TESTED_EMAILS);

	useEffect(() => {
		setList(getStoredTestedEmails());

		const handler = (e: Event) => {
			const customEvent = e as CustomEvent<TestedEmailRecord[]>;
			if (customEvent.detail) {
				setList(customEvent.detail);
			} else {
				setList(getStoredTestedEmails());
			}
		};

		window.addEventListener(CHECK_EVENT_NAME, handler);
		window.addEventListener("storage", handler);

		return () => {
			window.removeEventListener(CHECK_EVENT_NAME, handler);
			window.removeEventListener("storage", handler);
		};
	}, []);

	return { list };
}
