import type { ReactNode } from "react";

export function HeroAtmosphere() {
	const fx = {
		glow: "linear-gradient(to top, rgba(0, 111, 254, 0.3) 0%, transparent 62%)",
		line: "rgba(0, 111, 254, 0.16)",
	};
	const lineMask =
		"linear-gradient(to top, black 0%, rgba(0, 0, 0, 0.22) 100%)";

	return (
		<div aria-hidden className="pointer-events-none absolute inset-0 z-0">
			<div className="absolute inset-0" style={{ backgroundImage: fx.glow }} />
			<div
				className="absolute inset-0"
				style={{
					backgroundImage: `repeating-linear-gradient(to right, transparent 0, transparent 3px, ${fx.line} 3px, ${fx.line} 3.55px)`,
					maskImage: lineMask,
					WebkitMaskImage: lineMask,
				}}
			/>
		</div>
	);
}

export function HeroWindowChrome({
	children,
	action,
}: {
	children: ReactNode;
	action?: ReactNode;
}) {
	return (
		<div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-[20px] bg-[#F5F6F8] p-[7px] pt-8 sm:rounded-[24px] sm:p-2 sm:pt-9 dark:bg-[#1C1C1E] dark:ring-1 dark:ring-white/10">
			<div
				aria-hidden
				className="absolute top-[11px] left-3.5 flex items-center gap-[7px] sm:top-3 sm:left-4"
			>
				<span className="size-[11px] rounded-full bg-[#ff5f57] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.12)] sm:size-3" />
				<span className="size-[11px] rounded-full bg-[#febc2e] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.12)] sm:size-3" />
				<span className="size-[11px] rounded-full bg-[#28c840] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.12)] sm:size-3" />
			</div>
			{action ? (
				<div className="absolute top-[6px] right-2.5 z-20 sm:top-1.5 sm:right-3">
					{action}
				</div>
			) : null}
			<div className="relative min-h-0 flex-1 overflow-hidden rounded-[13px] bg-bg-white-0 sm:rounded-[16px] dark:bg-black">
				{children}
			</div>
		</div>
	);
}
