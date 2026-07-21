export function formatRelativeTime(iso: string | Date | null | undefined) {
	if (!iso) return "—";
	const date = typeof iso === "string" ? new Date(iso) : iso;
	const diffMs = Date.now() - date.getTime();
	const mins = Math.floor(diffMs / 60_000);
	if (mins < 1) return "just now";
	if (mins < 60) return `${mins}m ago`;
	const hours = Math.floor(mins / 60);
	if (hours < 24) return `${hours}h ago`;
	const days = Math.floor(hours / 24);
	if (days < 7) return `${days}d ago`;
	return date.toLocaleDateString(undefined, {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

export function formatDateTime(iso: string | Date | null | undefined) {
	if (!iso) return "—";
	try {
		const date = typeof iso === "string" ? new Date(iso) : iso;
		return date.toLocaleString(undefined, {
			month: "short",
			day: "numeric",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	} catch {
		return String(iso);
	}
}

export function formatNumber(n: number | null | undefined) {
	if (n == null) return "—";
	return n.toLocaleString();
}

export function truncateId(id: string, keep = 10) {
	if (id.length <= keep + 3) return id;
	return `${id.slice(0, keep)}…`;
}

export function formatRecipients(toEmails: unknown) {
	if (Array.isArray(toEmails)) return toEmails.join(", ");
	if (typeof toEmails === "string") return toEmails;
	return "—";
}
