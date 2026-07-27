import { useParams } from "next/navigation";

export function useMailboxId(): string {
	const params = useParams() as { mailboxId?: string };
	return params.mailboxId ?? "";
}
