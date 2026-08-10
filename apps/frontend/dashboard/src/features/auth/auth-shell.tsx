import { Logo } from "@reloop/ui/logo";
import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";
import { ThemeToggle } from "#/features/dashboard/page-header/theme-toggle";

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

/** Fixed corner control — matches onboarding so theme is always reachable. */
function AuthThemeToggle() {
	return (
		<div className="fixed right-5 bottom-5 z-50 sm:right-6 sm:bottom-6">
			<ThemeToggle />
		</div>
	);
}

/**
 * Centered single-column auth chrome (login, signup, etc.).
 * Pass `hideLogo` when the form provides its own logo (e.g. AuthCard).
 */
export function AuthShell({
	children,
	direction,
	hideLogo = false,
}: {
	children: ReactNode;
	direction: number;
	/** Hide the shell logo (use when children include AuthCard / their own brand mark). */
	hideLogo?: boolean;
}) {
	return (
		<div className="relative flex h-dvh flex-col items-center justify-center">
			<AuthThemeToggle />
			<div
				className={
					// AuthCard needs enough width for the terms line + social row without clipping.
					hideLogo ? "w-full max-w-lg p-5 md:p-8" : "w-full max-w-sm p-5 md:p-8"
				}
			>
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
				{/* Card-mode pages (hideLogo) own step animation inside the card. */}
				{hideLogo ? (
					children
				) : (
					<AuthStepFrame direction={direction}>{children}</AuthStepFrame>
				)}
			</div>
		</div>
	);
}
