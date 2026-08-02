"use client";

import * as React from "react";
import type { CommandAction } from "#/features/dashboard/command-menu";

interface PageActionGroup {
	/** Heading shown in the command menu (e.g. "API Keys"). */
	heading: string;
	actions: CommandAction[];
}

type RegisterFn = (id: string, group: PageActionGroup) => void;
type UnregisterFn = (id: string) => void;

/**
 * Stable dispatch context — register/unregister never change identity,
 * so the hook's effect doesn't re-fire when groups update.
 */
const DispatchContext = React.createContext<{
	register: RegisterFn;
	unregister: UnregisterFn;
} | null>(null);

/** State context — holds the current set of registered groups. */
const StateContext = React.createContext<Map<string, PageActionGroup>>(
	new Map(),
);

/**
 * Wrap the app shell so both the command menu and individual pages
 * can participate in the same context.
 */
export function CommandMenuProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const [groups, setGroups] = React.useState<Map<string, PageActionGroup>>(
		() => new Map(),
	);

	const register = React.useCallback(
		(id: string, group: PageActionGroup) => {
			setGroups((prev) => {
				const next = new Map(prev);
				next.set(id, group);
				return next;
			});
		},
		[],
	);

	const unregister = React.useCallback((id: string) => {
		setGroups((prev) => {
			if (!prev.has(id)) return prev;
			const next = new Map(prev);
			next.delete(id);
			return next;
		});
	}, []);

	const dispatch = React.useMemo(
		() => ({ register, unregister }),
		[register, unregister],
	);

	return (
		<DispatchContext.Provider value={dispatch}>
			<StateContext.Provider value={groups}>
				{children}
			</StateContext.Provider>
		</DispatchContext.Provider>
	);
}

/**
 * Read all page-specific action groups registered in the current context.
 * Used by `CommandMenuGlobal` to render page-scoped groups.
 */
export function useCommandMenuActions(): PageActionGroup[] {
	const groups = React.useContext(StateContext);
	return React.useMemo(() => Array.from(groups.values()), [groups]);
}

/**
 * Register page-specific command-menu actions.
 * Automatically unregisters when the calling component unmounts
 * (i.e. when the user navigates away).
 *
 * @param id     Stable unique key for this page (e.g. `"api-keys"`).
 * @param heading  Group heading shown in the palette (e.g. `"API Keys"`).
 * @param actions  The actions to register. Must be referentially stable (wrap in useMemo).
 */
export function useRegisterCommandActions(
	id: string,
	heading: string,
	actions: CommandAction[],
) {
	const dispatch = React.useContext(DispatchContext);

	React.useEffect(() => {
		if (!dispatch) return;
		dispatch.register(id, { heading, actions });
		return () => dispatch.unregister(id);
	}, [dispatch, id, heading, actions]);
}
