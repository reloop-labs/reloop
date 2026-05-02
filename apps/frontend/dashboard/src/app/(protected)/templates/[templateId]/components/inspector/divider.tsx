export function Divider({ label }: { label?: string }) {
	if (label) {
		return (
			<div className="my-2 flex items-center gap-2">
				<hr className="flex-1 border-(--re-border)" />
				<span className="text-[10px] text-(--re-text-muted) uppercase tracking-wide">
					{label}
				</span>
				<hr className="flex-1 border-(--re-border)" />
			</div>
		);
	}
	return <hr className="my-2 border-(--re-border)" />;
}
