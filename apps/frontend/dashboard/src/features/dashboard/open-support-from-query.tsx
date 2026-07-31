"use client";

import { useUIStore } from "#/store/use-ui-store";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

/**
 * Opens the in-house Support chat panel when the URL includes
 * `?support=open` (or `?support=1`), then strips the param so a refresh
 * does not re-open it. Used by marketing contact deep-links.
 */
function OpenSupportFromQueryInner() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const pathname = usePathname();
	const setIsAiPanelOpen = useUIStore((s) => s.setIsAiPanelOpen);
	const setAiPanelActiveTab = useUIStore((s) => s.setAiPanelActiveTab);

	useEffect(() => {
		const support = searchParams.get("support");
		if (support !== "open" && support !== "1") return;

		setAiPanelActiveTab("support");
		setIsAiPanelOpen(true);

		const next = new URLSearchParams(searchParams.toString());
		next.delete("support");
		const qs = next.toString();
		router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
	}, [
		pathname,
		router,
		searchParams,
		setAiPanelActiveTab,
		setIsAiPanelOpen,
	]);

	return null;
}

export function OpenSupportFromQuery() {
	return (
		<Suspense fallback={null}>
			<OpenSupportFromQueryInner />
		</Suspense>
	);
}
