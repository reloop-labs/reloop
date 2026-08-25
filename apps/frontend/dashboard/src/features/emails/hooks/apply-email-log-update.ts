import type { EmailListResponse, EmailLogData } from "./use-emails-query";

/**
 * Patch an in-memory sent-email list.
 * Existing rows update in place. New rows prepend on page 1 so a send
 * shows up without waiting for the refetch.
 */
export function applyEmailLogUpdate(
	current: EmailListResponse | undefined,
	row: EmailLogData,
): EmailListResponse | undefined {
	if (!current) return current;
	const idx = current.data.findIndex((item) => item.id === row.id);
	if (idx >= 0) {
		const data = current.data.slice();
		data[idx] = { ...data[idx], ...row };
		return { ...current, data };
	}
	if (current.page !== 1) return current;
	return {
		...current,
		data: [row, ...current.data].slice(0, current.limit),
		total: current.total + 1,
	};
}
