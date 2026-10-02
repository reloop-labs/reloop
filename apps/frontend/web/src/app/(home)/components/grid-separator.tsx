export function GridSeparator({ className }: { className?: string } = {}) {
	return (
		<div
			aria-hidden="true"
			className={`@container grid w-full grid-cols-[auto_1fr_auto] bg-[#ebebeb] lg:grid-cols-[1fr_auto_1fr] dark:bg-[#292929] ${className ?? ""}`}
		>
			<div
				className="grid"
				style={{ gridTemplateColumns: "repeat(1, minmax(0, 1fr))" }}
			>
				<div aria-hidden="true" className="w-full p-[0.5px]">
					<div className="h-full w-2 rounded bg-card/90 md:w-6 lg:w-full" />
				</div>
			</div>
			<div className="mx-auto w-full max-w-276 max-w-[1104px] p-[0.5px] lg:min-w-276 lg:min-w-[1104px]">
				<div data-slot="content" className="h-full rounded bg-card/90">
					<div className="h-24" />
				</div>
			</div>
			<div
				className="grid"
				style={{ gridTemplateColumns: "repeat(1, minmax(0, 1fr))" }}
			>
				<div aria-hidden="true" className="p-[0.5px]">
					<div className="h-full w-2 rounded bg-card/90 md:w-6 lg:w-full" />
				</div>
			</div>
		</div>
	);
}

