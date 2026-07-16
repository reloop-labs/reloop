import { useRouterState } from "@tanstack/react-router";

/** Current pathname without app basepath quirks (router location). */
export function useInboxPathname(): string {
	return useRouterState({ select: (s) => s.location.pathname });
}
