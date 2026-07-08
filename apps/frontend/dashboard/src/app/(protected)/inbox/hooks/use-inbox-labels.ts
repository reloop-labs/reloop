"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

export type InboxLabel = {
	id: string;
	name: string;
	icon?: "bookmark" | "folder";
};

const DEFAULT_LABELS: InboxLabel[] = [
	{ id: "notes", name: "Notes", icon: "bookmark" },
	{ id: "other", name: "Other", icon: "folder" },
];

const labelsKey = (mailboxId: string) => `inbox-labels-${mailboxId}`;
const assignmentsKey = (mailboxId: string) =>
	`inbox-label-assignments-${mailboxId}`;

const readLabels = (mailboxId: string): InboxLabel[] => {
	if (typeof window === "undefined") return DEFAULT_LABELS;
	try {
		const raw = localStorage.getItem(labelsKey(mailboxId));
		if (!raw) {
			localStorage.setItem(labelsKey(mailboxId), JSON.stringify(DEFAULT_LABELS));
			return DEFAULT_LABELS;
		}
		return JSON.parse(raw) as InboxLabel[];
	} catch {
		return DEFAULT_LABELS;
	}
};

const readAssignments = (mailboxId: string): Record<string, string[]> => {
	if (typeof window === "undefined") return {};
	try {
		const raw = localStorage.getItem(assignmentsKey(mailboxId));
		return raw ? (JSON.parse(raw) as Record<string, string[]>) : {};
	} catch {
		return {};
	}
};

export const useInboxLabels = (mailboxId: string) => {
	const [labels, setLabels] = useState<InboxLabel[]>(() =>
		readLabels(mailboxId),
	);
	const [assignments, setAssignments] = useState<Record<string, string[]>>(
		() => readAssignments(mailboxId),
	);

	useEffect(() => {
		setLabels(readLabels(mailboxId));
		setAssignments(readAssignments(mailboxId));
	}, [mailboxId]);

	const persistLabels = useCallback(
		(next: InboxLabel[]) => {
			setLabels(next);
			localStorage.setItem(labelsKey(mailboxId), JSON.stringify(next));
		},
		[mailboxId],
	);

	const persistAssignments = useCallback(
		(next: Record<string, string[]>) => {
			setAssignments(next);
			localStorage.setItem(assignmentsKey(mailboxId), JSON.stringify(next));
		},
		[mailboxId],
	);

	const addLabel = useCallback(
		(name: string) => {
			const trimmed = name.trim();
			if (!trimmed) return null;
			const id = trimmed.toLowerCase().replace(/\s+/g, "-");
			if (labels.some((l) => l.id === id)) return null;
			const next = [...labels, { id, name: trimmed, icon: "folder" as const }];
			persistLabels(next);
			return id;
		},
		[labels, persistLabels],
	);

	const getLabelCount = useCallback(
		(labelId: string) => {
			return Object.values(assignments).filter((ids) =>
				ids.includes(labelId),
			).length;
		},
		[assignments],
	);

	const getThreadIdsForLabel = useCallback(
		(labelId: string) => {
			return Object.entries(assignments)
				.filter(([, ids]) => ids.includes(labelId))
				.map(([threadId]) => threadId);
		},
		[assignments],
	);

	const assignThreadToLabel = useCallback(
		(threadId: string, labelId: string) => {
			const current = assignments[threadId] ?? [];
			if (current.includes(labelId)) return;
			persistAssignments({
				...assignments,
				[threadId]: [...current, labelId],
			});
		},
		[assignments, persistAssignments],
	);

	return useMemo(
		() => ({
			labels,
			addLabel,
			getLabelCount,
			getThreadIdsForLabel,
			assignThreadToLabel,
		}),
		[labels, addLabel, getLabelCount, getThreadIdsForLabel, assignThreadToLabel],
	);
};
