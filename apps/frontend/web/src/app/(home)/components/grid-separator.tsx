export function GridSeparator({ className }: { className?: string } = {}) {
	return (
		<div
			aria-hidden="true"
			className={`w-full bg-white dark:bg-black ${className ?? ""}`}
		>
			<div className="relative mx-auto w-full max-w-5xl border-stroke-soft-100 border-x md:max-w-7xl dark:border-white/10">
				<div className="h-24 border-stroke-soft-100 border-t sm:h-24 dark:border-white/10" />
			</div>
		</div>
	);
}
