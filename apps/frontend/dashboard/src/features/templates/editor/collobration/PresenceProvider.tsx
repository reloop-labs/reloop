import type React from "react";
import { createContext, useContext } from "react";
import type { Awareness } from "y-protocols/awareness";
import {
	type PresenceUser,
	useOthers,
	useSelf,
	useUsers,
} from "./hooks/usePresence";

// ── Context ─────────────────────────────────────────────────────────────────

interface PresenceContextValue {
	awareness: Awareness | null;
}

const PresenceContext = createContext<PresenceContextValue>({
	awareness: null,
});

// ── Provider ─────────────────────────────────────────────────────────────────

interface PresenceProviderProps {
	awareness: Awareness | null;
	children: React.ReactNode;
}

export function PresenceProvider({
	awareness,
	children,
}: PresenceProviderProps) {
	return (
		<PresenceContext.Provider value={{ awareness }}>
			{children}
		</PresenceContext.Provider>
	);
}

// ── Context hooks (call without passing awareness explicitly) ─────────────────

/** All connected users including self */
export function usePresenceUsers(): PresenceUser[];
export function usePresenceUsers<T>(
	selector: (users: PresenceUser[]) => T,
	equalityFn?: (a: T, b: T) => boolean,
): T | null;
export function usePresenceUsers<T = PresenceUser[]>(
	selector?: (users: PresenceUser[]) => T,
	equalityFn?: (a: T, b: T) => boolean,
): T | PresenceUser[] | null {
	const { awareness } = useContext(PresenceContext);
	// @ts-expect-error – overload forwarding
	return useUsers(awareness, selector, equalityFn);
}

/** All users except the current user */
export function usePresenceOthers(): PresenceUser[];
export function usePresenceOthers<T>(
	selector: (others: PresenceUser[]) => T,
	equalityFn?: (a: T, b: T) => boolean,
): T | null;
export function usePresenceOthers<T = PresenceUser[]>(
	selector?: (others: PresenceUser[]) => T,
	equalityFn?: (a: T, b: T) => boolean,
): T | PresenceUser[] | null {
	const { awareness } = useContext(PresenceContext);
	// @ts-expect-error – overload forwarding
	return useOthers(awareness, selector, equalityFn);
}

/** The current user's own presence state */
export function usePresenceSelf(): PresenceUser | null;
export function usePresenceSelf<T>(
	selector: (self: PresenceUser | null) => T,
	equalityFn?: (a: T, b: T) => boolean,
): T | null;
export function usePresenceSelf<T = PresenceUser | null>(
	selector?: (self: PresenceUser | null) => T,
	equalityFn?: (a: T, b: T) => boolean,
): T | PresenceUser | null {
	const { awareness } = useContext(PresenceContext);
	// @ts-expect-error – overload forwarding
	return useSelf(awareness, selector, equalityFn);
}
