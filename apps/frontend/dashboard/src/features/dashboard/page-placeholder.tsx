/** Empty shell for pages that are not ported yet. */
export function PagePlaceholder({
	title,
	description,
}: {
	title: string;
	description?: string;
}) {
	return (
		<div className="flex min-h-full flex-col gap-2 p-8">
			<h1 className="font-semibold text-label-lg text-text-strong-950">
				{title}
			</h1>
			<p className="max-w-md text-[13px] text-text-sub-600">
				{description ??
					"This page will be ported next. Use the sidebar to navigate."}
			</p>
		</div>
	);
}
