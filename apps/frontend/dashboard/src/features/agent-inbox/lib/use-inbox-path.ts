import { usePathname, useSearchParams } from "next/navigation";

/** Current pathname without app basepath quirks (router location). */
export function useInboxPathname(): string {
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const folder = searchParams?.get("folder");
	if (folder) {
		const mailboxId = searchParams?.get("mailboxId") ?? "";
		return mailboxId ? `/inbox/${mailboxId}/${folder}` : `/inbox/${folder}`;
	}
	return pathname;
}
