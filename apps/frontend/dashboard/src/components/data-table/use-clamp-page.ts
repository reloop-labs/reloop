import { parseAsInteger, useQueryState } from "nuqs";
import { useEffect } from "react";

/**
 * Keeps the `?page=` param within range. Without it, deleting the last rows on
 * the last page (or opening a stale `?page=`) renders an empty page, which the
 * tables show as the first-run "Create your first …" state.
 *
 * `ready` should be false while the list is loading so a transient `total` of
 * 0 doesn't reset the page.
 */
export function useClampPage(
	totalPages: number,
	ready: boolean,
	param = "page",
): void {
	const [page, setPage] = useQueryState(param, parseAsInteger.withDefault(1));

	useEffect(() => {
		if (!ready) return;
		const maxPage = Math.max(1, totalPages);
		if (page < 1) void setPage(1);
		else if (page > maxPage) void setPage(maxPage);
	}, [ready, page, totalPages, setPage]);
}
