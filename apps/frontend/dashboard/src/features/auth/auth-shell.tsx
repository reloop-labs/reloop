import { Logo } from "@reloop/ui/logo";
import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";

export const authStepVariants = {
	initial: (direction: number) => ({
		opacity: 0,
		transform: `translateX(${direction > 0 ? 20 : -20}px)`,
	}),
	animate: {
		opacity: 1,
		transform: "translateX(0px)",
	},
	exit: (direction: number) => ({
		opacity: 0,
		transform: `translateX(${direction > 0 ? -20 : 20}px)`,
	}),
};

export function AuthShell({
	children,
	direction,
}: {
	children: ReactNode;
	direction: number;
}) {
	return (
		<div className="flex h-dvh flex-col items-center justify-center">
			<AnimatePresence mode="wait" custom={direction}>
				<div className="w-full max-w-sm p-5 md:p-8">
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
					{children}
				</div>
			</AnimatePresence>
		</div>
	);
}
