export function SectionHeader({ label }: { label: string }) {
	return (
		<p className="px-4 pt-3 pb-1 font-semibold text-sm text-text-strong-950">
			{label}
		</p>
	);
}
