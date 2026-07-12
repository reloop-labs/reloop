"use client";

import { usePathname } from "next/navigation";

/**
 * Most settings pages read best in a narrow column, but a few (e.g. the plans
 * comparison table) need the full content width. Opt those out of the
 * `max-w-3xl` container by pathname.
 */
const FULL_WIDTH_ROUTES = ["/settings/billing/plans"];

export function SettingsShell({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	const isFullWidth = FULL_WIDTH_ROUTES.some((route) =>
		pathname?.startsWith(route),
	);

	if (isFullWidth) {
		return <div className="w-full flex-1">{children}</div>;
	}

	return (
		<div className="mx-auto max-w-3xl p-6 lg:p-8">
			<div className="w-full flex-1 pb-10">{children}</div>
		</div>
	);
}
