import { useRouterState } from "#/lib/navigation";

/** Current pathname without app basepath quirks (router location). */
export function useInboxPathname(): string {
	return useRouterState({ select: (s) => s.location.pathname });
}
