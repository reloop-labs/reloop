import { useParams } from "#/lib/navigation";

export function useMailboxId(): string {
	const params = useParams({ strict: false }) as { mailboxId?: string };
	return params.mailboxId ?? "";
}
