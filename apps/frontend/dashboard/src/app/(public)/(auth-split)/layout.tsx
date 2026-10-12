import type { ReactNode } from "react";
import { AuthAside } from "#/features/auth/auth-aside";

/**
 * Shared split layout for login and signup. The left panel lives here so it
 * stays mounted (no reload, no quote reset) when switching between the two.
 */
export default function AuthSplitLayout({ children }: { children: ReactNode }) {
	return (
		<div className="flex min-h-dvh">
			<aside className="hidden w-[400px] shrink-0 border-stroke-soft-200 border-r bg-bg-weak-50 lg:flex xl:w-[440px] dark:border-stroke-soft-100/40 dark:bg-white/[0.03]">
				<AuthAside />
			</aside>
			<div className="min-w-0 flex-1">{children}</div>
		</div>
	);
}
