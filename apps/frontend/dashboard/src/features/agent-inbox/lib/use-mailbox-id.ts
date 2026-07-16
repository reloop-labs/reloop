import { useParams } from "@tanstack/react-router";

export function useMailboxId(): string {
	const params = useParams({ strict: false }) as { mailboxId?: string };
	return params.mailboxId ?? "";
}
