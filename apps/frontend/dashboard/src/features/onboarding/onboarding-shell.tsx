import { cn } from "@reloop/ui/cn";
import { Logo } from "@reloop/ui/logo";
import type { ReactNode } from "react";
import { ThemeToggle } from "#/features/dashboard/page-header/theme-toggle";

const stepMaxWidth = {
	1: "max-w-5xl",
	2: "max-w-3xl",
} as const;

export function OnboardingShell({
	step,
	children,
}: {
	step: number;
	children: ReactNode;
}) {
	const maxWidthClass = step === 2 ? stepMaxWidth[2] : stepMaxWidth[1];

	return (
		<div className="relative flex min-h-screen w-full flex-col items-center overflow-x-clip">
			<div className="fixed right-5 bottom-5 z-50 sm:right-6 sm:bottom-6">
				<ThemeToggle />
			</div>
			<div
				className={cn(
					"relative flex min-h-screen w-full flex-col border-stroke-soft-100 border-x dark:border-stroke-soft-100/40",
					"transition-[max-width] duration-[320ms] ease-[cubic-bezier(0.23,1,0.32,1)]",
					maxWidthClass,
				)}
			>
				<a
					href="/home"
					aria-label="Reloop home"
					className="absolute top-5 left-1/2 z-50 flex -translate-x-1/2 items-center space-x-2 transition-opacity hover:opacity-80"
				>
					<Logo className="h-10 w-10 lg:h-11 lg:w-11" />
					<span className="-ml-3 font-semibold text-text-strong-950 text-xl">
						Reloop
					</span>
				</a>
				<div className="flex w-full flex-1 flex-col justify-center pt-24 pb-20">
					<div className="w-full border-stroke-soft-100 border-y bg-bg-white-0 dark:border-stroke-soft-100/40 dark:bg-bg-white-0">
						{children}
					</div>
				</div>
			</div>
		</div>
	);
}
