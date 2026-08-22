import { useParams, useSearchParams } from "next/navigation";

export function useMailboxId(): string {
	const params = useParams() as { mailboxId?: string };
	const searchParams = useSearchParams();
	return params.mailboxId ?? searchParams?.get("mailboxId") ?? "";
}
