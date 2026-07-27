import { cn } from "@reloop/ui/cn";
import type { ReactNode } from "react";

/** 60×60 cell SVG grid — matches dub.co changelog hero. */
export function ChangelogGridPattern({
	className,
	patternOffset = [0, 0] as [number, number],
	id,
}: {
	className?: string;
	patternOffset?: [number, number];
	id: string;
}) {
	const [offsetX, offsetY] = patternOffset;

	return (
		<svg
			className={cn(
				"pointer-events-none text-[#e5e5e5]/60 dark:text-white/15",
				className,
			)}
			width="100%"
			height="100%"
			aria-hidden="true"
		>
			<defs>
				<pattern
					id={id}
					x={offsetX}
					y={offsetY}
					width="60"
					height="60"
					patternUnits="userSpaceOnUse"
				>
					<path
						d="M 60 0 L 0 0 0 60"
						fill="transparent"
						stroke="currentColor"
						strokeWidth="2"
					/>
				</pattern>
			</defs>
			<rect fill={`url(#${id})`} width="100%" height="100%" />
		</svg>
	);
}

export function ChangelogGridHero({ children }: { children: ReactNode }) {
	return (
		<section className="relative overflow-clip border-[#e5e5e5] border-b px-4 dark:border-white/10">
			<div className="relative z-0 mx-auto max-w-[1080px] px-4 sm:px-12">
				{/* Vertical edges of the title box */}
				<div
					className="pointer-events-none absolute inset-0 border-[#e5e5e5] border-x [mask-image:linear-gradient(transparent,black)] dark:border-white/10"
					aria-hidden="true"
				/>

				{/* Side grids outside the content column */}
				<div
					className="-translate-x-1/2 pointer-events-none absolute inset-y-0 left-1/2 w-[1800px] [mask-composite:intersect] [mask-image:linear-gradient(transparent,black)]"
					aria-hidden="true"
				>
					<div className="absolute inset-x-[360px] inset-y-0">
						<ChangelogGridPattern
							id="changelog-grid-left"
							className="absolute inset-[unset] right-full bottom-0 h-[600px] w-[360px] [mask-image:linear-gradient(90deg,transparent,black)]"
							patternOffset={[0, 0]}
						/>
						<ChangelogGridPattern
							id="changelog-grid-right"
							className="absolute inset-[unset] bottom-0 left-full h-[600px] w-[360px] [mask-image:linear-gradient(270deg,transparent,black)]"
							patternOffset={[-1, 0]}
						/>
					</div>
				</div>

				{/* Center grid inside the title box */}
				<div
					className="pointer-events-none absolute inset-x-px inset-y-0 overflow-hidden [mask-image:linear-gradient(transparent,black)]"
					aria-hidden="true"
				>
					<ChangelogGridPattern
						id="changelog-grid-center"
						className="-translate-x-1/2 absolute inset-[unset] bottom-0 left-1/2 h-[600px] w-[1080px]"
						patternOffset={[-1, 0]}
					/>
				</div>

				<div className="relative">{children}</div>
			</div>
		</section>
	);
}

export function ChangelogGridBody({ children }: { children: ReactNode }) {
	return (
		<section className="relative overflow-clip border-[#e5e5e5] border-b px-4 dark:border-white/10">
			<div className="relative z-0 mx-auto max-w-[1080px] border-[#e5e5e5] border-x px-4 sm:px-12 dark:border-white/10">
				{children}
			</div>
		</section>
	);
}
