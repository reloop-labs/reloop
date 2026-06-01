"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Awareness } from "y-protocols/awareness";

// ── Types ──────────────────────────────────────────────────────────────────

export interface PresenceUser {
	/** Yjs client id */
	clientId: number;
	name?: string;
	color: string;
	avatar?: string;
	email?: string;
	/** Any extra fields callers set via awareness.setLocalStateField */
	[key: string]: unknown;
}

type AwarenessState = Map<number, { user?: Omit<PresenceUser, "clientId"> }>;

/** Selector receives the full awareness state map and can return any derived value */
type Selector<T> = (state: AwarenessState) => T | null;

// ── Internal helpers ────────────────────────────────────────────────────────

function statesFromAwareness(awareness: Awareness): AwarenessState {
	return awareness.getStates() as AwarenessState;
}

function useSyncedState<T>(
	awareness: Awareness | null,
	selector: Selector<T>,
	equalityFn: (a: T, b: T) => boolean = Object.is,
): T | null {
	const selectorRef = useRef(selector);
	const equalityRef = useRef(equalityFn);
	selectorRef.current = selector;
	equalityRef.current = equalityFn;

	const [value, setValue] = useState<T | null>(() =>
		awareness ? selectorRef.current(statesFromAwareness(awareness)) : null,
	);

	useEffect(() => {
		if (!awareness) return;

		// Always re-evaluate immediately when awareness changes
		setValue(selectorRef.current(statesFromAwareness(awareness)));

		const handler = () => {
			const next = selectorRef.current(statesFromAwareness(awareness));
			setValue((prev) => {
				if (prev !== null && next !== null && equalityRef.current(prev, next))
					return prev;
				return next;
			});
		};

		awareness.on("change", handler);
		return () => awareness.off("change", handler);
	}, [awareness]);

	return value;
}

// ── Public hooks ────────────────────────────────────────────────────────────

/**
 * Returns the full list of connected users (including self), re-rendering
 * only when the selected subset changes.
 *
 * @example
 * const users = useUsers(awareness);
 * // → PresenceUser[]
 *
 * const count = useUsers(awareness, (users) => users.length);
 * // → number
 */
export function useUsers(awareness: Awareness | null): PresenceUser[];
export function useUsers<T>(
	awareness: Awareness | null,
	selector: (users: PresenceUser[]) => T,
	equalityFn?: (a: T, b: T) => boolean,
): T | null;
export function useUsers<T = PresenceUser[]>(
	awareness: Awareness | null,
	selector?: (users: PresenceUser[]) => T,
	equalityFn?: (a: T, b: T) => boolean,
): T | PresenceUser[] | null {
	const toUsers = useCallback(
		(state: AwarenessState): PresenceUser[] =>
			Array.from(state.entries())
				.filter(([, s]) => s.user)
				.map(
					([clientId, s]) =>
						({ clientId, ...(s.user as object) }) as PresenceUser,
				),
		[],
	);

	const mapSelector = useCallback(
		(state: AwarenessState) => {
			const users = toUsers(state);
			return selector ? selector(users) : (users as unknown as T);
		},
		[selector, toUsers],
	);

	return useSyncedState(awareness, mapSelector, equalityFn) as
		| T
		| PresenceUser[]
		| null;
}

/**
 * Returns the awareness state of the current user (self).
 *
 * @example
 * const self = useSelf(awareness);
 * // → PresenceUser | null
 *
 * const myColor = useSelf(awareness, (me) => me?.color);
 */
export function useSelf(awareness: Awareness | null): PresenceUser | null;
export function useSelf<T>(
	awareness: Awareness | null,
	selector: (self: PresenceUser | null) => T,
	equalityFn?: (a: T, b: T) => boolean,
): T | null;
export function useSelf<T = PresenceUser | null>(
	awareness: Awareness | null,
	selector?: (self: PresenceUser | null) => T,
	equalityFn?: (a: T, b: T) => boolean,
): T | PresenceUser | null {
	const mapSelector = useCallback(
		(state: AwarenessState) => {
			if (!awareness) return null;
			const entry = state.get(awareness.clientID);
			const self = entry?.user
				? ({
						clientId: awareness.clientID,
						...(entry.user as object),
					} as PresenceUser)
				: null;
			return selector ? selector(self) : (self as unknown as T);
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[awareness?.clientID, selector],
	);

	return useSyncedState(awareness, mapSelector, equalityFn) as
		| T
		| PresenceUser
		| null;
}

/**
 * Returns all users *except* the current user (self).
 *
 * @example
 * const others = useOthers(awareness);
 * // → PresenceUser[]
 */
export function useOthers(awareness: Awareness | null): PresenceUser[];
export function useOthers<T>(
	awareness: Awareness | null,
	selector: (others: PresenceUser[]) => T,
	equalityFn?: (a: T, b: T) => boolean,
): T | null;
export function useOthers<T = PresenceUser[]>(
	awareness: Awareness | null,
	selector?: (others: PresenceUser[]) => T,
	equalityFn?: (a: T, b: T) => boolean,
): T | PresenceUser[] | null {
	const mapSelector = useCallback(
		(state: AwarenessState): T => {
			const selfId = awareness?.clientID;
			const others = Array.from(state.entries())
				.filter(([id, s]) => id !== selfId && s.user)
				.map(
					([clientId, s]) =>
						({ clientId, ...(s.user as object) }) as PresenceUser,
				);
			return selector ? selector(others) : (others as unknown as T);
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[awareness?.clientID, selector],
	);

	return useSyncedState(awareness, mapSelector, equalityFn) as
		| T
		| PresenceUser[]
		| null;
}
