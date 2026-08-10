import { Logo } from "@reloop/ui/logo";
import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";

export const authStepVariants = {
	initial: (direction: number) => ({
		opacity: 0,
		x: direction > 0 ? 16 : -16,
	}),
	animate: {
		opacity: 1,
		x: 0,
		// Stay in document flow so AnimatedHeight can measure the active step.
		position: "relative" as const,
	},
	exit: (direction: number) => ({
		opacity: 0,
		x: direction > 0 ? -16 : 16,
		// Leave flow so the card height can tween to the incoming step only.
		position: "absolute" as const,
		top: 0,
		left: 0,
		right: 0,
	}),
};

function AuthStepFrame({
	children,
	direction,
}: {
	children: ReactNode;
	direction: number;
}) {
	return (
		<AnimatePresence mode="wait" custom={direction}>
			{children}
		</AnimatePresence>
	);
}

/**
 * Centered single-column auth chrome (login, etc.).
 * Pass `aside` for a Cloudflare-style split: form left, panel right.
 * Pass `hideLogo` when the form provides its own logo (e.g. AuthCard).
 */
export function AuthShell({
	children,
	direction,
	aside,
	hideLogo = false,
}: {
	children: ReactNode;
	direction: number;
	/** When set, renders a full-height split layout with this content on the right (lg+). */
	aside?: ReactNode;
	/** Hide the shell logo (use when children include AuthCard / their own brand mark). */
	hideLogo?: boolean;
}) {
	if (aside !== undefined) {
		return (
			<div className="flex min-h-dvh w-full">
				{/* Form column — soft surface under AuthCard so the card reads as elevated */}
				<div className={"relative flex w-full flex-col lg:w-1/2"}>
					{!hideLogo ? (
						<div className="absolute top-6 left-6 z-10 md:top-8 md:left-8">
							<Logo className="h-10 w-10" />
						</div>
					) : null}
					<div className="flex flex-1 flex-col items-center justify-center px-5 py-16 md:px-8">
						<div className={hideLogo ? "w-full max-w-md" : "w-full max-w-md"}>
							{/* Card-mode pages (hideLogo) own their own step animation inside the card. */}
							{hideLogo ? (
								children
							) : (
								<AuthStepFrame direction={direction}>{children}</AuthStepFrame>
							)}
						</div>
					</div>
				</div>

				{/* Marketing / visual column — layout only; content supplied by the page */}
				<div
					className={
						hideLogo
							? "relative hidden min-h-dvh w-1/2 overflow-hidden border-stroke-soft-100 border-l bg-bg-white-0 lg:flex dark:border-stroke-soft-100/40"
							: "relative hidden min-h-dvh w-1/2 overflow-hidden border-stroke-soft-100 border-l bg-bg-weak-50 lg:flex dark:border-stroke-soft-100/40 dark:bg-bg-weak-50/40"
					}
				>
					{aside}
				</div>
			</div>
		);
	}

	return (
		<div className="flex h-dvh flex-col items-center justify-center">
			<div className="w-full max-w-sm p-5 md:p-8">
				{!hideLogo ? (
					<motion.div
						layout
						className="flex flex-col items-center justify-center gap-2"
					>
						<div className="mb-2 flex items-center justify-center">
							{/* Plain <a> so we leave /dashboard basePath and hit the marketing site root. */}
							<a
								href="/"
								aria-label="Reloop home"
								className="rounded-lg transition-opacity hover:opacity-80"
							>
								<Logo className="h-16" />
							</a>
						</div>
					</motion.div>
				) : null}
				<AuthStepFrame direction={direction}>{children}</AuthStepFrame>
			</div>
		</div>
	);
}
