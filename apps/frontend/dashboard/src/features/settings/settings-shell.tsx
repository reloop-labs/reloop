import type { ReactNode } from "react";
import { useRouterState } from "#/lib/navigation";

/**
 * Most settings pages read best in a narrow column, but a few (e.g. plans
 * comparison) need the full content width. Opt those out of `max-w-3xl` by path.
 */
const FULL_WIDTH_ROUTES = ["/settings/billing/plans"];

export function SettingsShell({ children }: { children: ReactNode }) {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const isFullWidth = FULL_WIDTH_ROUTES.some((route) =>
		pathname.startsWith(route),
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
