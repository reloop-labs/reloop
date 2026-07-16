/** Empty shell for settings pages that are not ported yet.
 * Padding comes from `SettingsShell` — do not add outer page padding here.
 */
export function SettingsPlaceholderPage({
	title,
	description,
}: {
	title: string;
	description?: string;
}) {
	return (
		<div className="flex min-h-full flex-col gap-2 pt-5">
			<h1 className="font-semibold text-label-lg text-text-strong-950">
				{title}
			</h1>
			<p className="max-w-md text-[13px] text-text-sub-600">
				{description ??
					"This settings page will be ported next. Use the sidebar to move between sections."}
			</p>
		</div>
	);
}
