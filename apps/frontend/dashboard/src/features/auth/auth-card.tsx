import { Logo } from "@reloop/ui/logo";
import type { ReactNode } from "react";

/**
 * Auth form card — same chrome as the add-contact method card:
 * outer soft shell + inset white panel; optional footer sits in the shell
 * between the inner and outer borders (like SingleContactForm's action bar).
 *
 * Header matches the create-account reference: brand mark, title, description,
 * dashed rule.
 */
export function AuthCard({
	title,
	description,
	children,
	footer,
	showBrandMark = true,
}: {
	title: ReactNode;
	description?: ReactNode;
	children: ReactNode;
	/** Rendered in the soft shell below the inset panel (e.g. "Already have an account?"). */
	footer?: ReactNode;
	/** Gray logo tile above the title (default true). */
	showBrandMark?: boolean;
}) {
	return (
		<div className="w-full font-sans">
			{/* Outer soft shell */}
			<div className="overflow-hidden rounded-[18px] border border-stroke-soft-200 bg-bg-soft-50 dark:border-stroke-soft-100/40">
				{/* Inset white panel */}
				<div className="m-0.5 space-y-6 rounded-2xl border border-stroke-soft-200 bg-bg-white-0 px-6 pt-5 pb-6 dark:border-stroke-soft-100/40">
					{/* Header: icon → title → description → dashed rule */}
					<div>
						{showBrandMark ? (
							// Two-layer logo tile: outer gray shell + inset white panel (same chrome as this card)
							<div
								className="mb-5 w-fit overflow-hidden rounded-2xl border border-stroke-soft-200 bg-bg-soft-50 dark:border-stroke-soft-100/40"
								aria-hidden
							>
								<div className="m-px flex size-11 items-center justify-center rounded-[14px] border border-stroke-soft-200 bg-bg-white-0 dark:border-stroke-soft-100/40">
									<Logo className="h-10 w-10" />
								</div>
							</div>
						) : null}

						<h2 className="font-semibold text-text-strong-950 text-xl tracking-tight">
							{title}
						</h2>
						{description ? (
							<div className="mt-0.5 font-medium text-sm text-text-sub-600 leading-relaxed">
								{description}
							</div>
						) : null}

						<div
							className="mt-4 border-stroke-soft-200 border-t border-dashed pb-2 dark:border-stroke-soft-100/40"
							aria-hidden
						/>
					</div>

					{children}
				</div>

				{/* Footer between inner panel and outer shell (matches add-contact action bar) */}
				{footer ? (
					<div className="px-6 pt-3 pb-3.5 text-center font-medium text-[13px] text-text-sub-600 dark:bg-bg-weak-50/40">
						{footer}
					</div>
				) : null}
			</div>
		</div>
	);
}
