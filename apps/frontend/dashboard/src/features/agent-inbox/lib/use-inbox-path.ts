import { usePathname } from "next/navigation";

/** Current pathname without app basepath quirks (router location). */
export function useInboxPathname(): string {
	return usePathname();
}
