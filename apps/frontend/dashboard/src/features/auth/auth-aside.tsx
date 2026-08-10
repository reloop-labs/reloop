/**
 * Decorative right panel for the split auth layout.
 * Layout chrome only — no marketing copy.
 */
export function AuthAside() {
	return (
		<div
			aria-hidden
			className="flex h-full w-full flex-col items-center justify-center p-12"
		>
			<div className="flex w-full max-w-md flex-col items-center gap-6">
				<div className="w-full rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-5 shadow-sm dark:border-stroke-soft-100/60">
					<div className="flex flex-col gap-3">
						<div className="h-2.5 w-2/5 rounded-full bg-bg-weak-50" />
						<div className="h-2.5 w-3/4 rounded-full bg-bg-weak-50" />
						<div className="h-2.5 w-1/2 rounded-full bg-bg-weak-50" />
					</div>
				</div>
				<div className="flex w-full flex-col gap-3 pl-6">
					<div className="h-10 w-full rounded-full border border-stroke-soft-200 border-dashed bg-bg-white-0/60 dark:border-stroke-soft-100/60" />
					<div className="h-10 w-full rounded-full border border-stroke-soft-200 border-dashed bg-bg-white-0/60 dark:border-stroke-soft-100/60" />
					<div className="h-10 w-full rounded-full border border-stroke-soft-200 border-dashed bg-bg-white-0/60 dark:border-stroke-soft-100/60" />
				</div>
			</div>
		</div>
	);
}
