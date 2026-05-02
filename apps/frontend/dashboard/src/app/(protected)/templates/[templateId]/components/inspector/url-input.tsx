export function UrlInput({
	value,
	onChange,
	placeholder = "https://",
}: {
	value: string;
	onChange: (v: string) => void;
	placeholder?: string;
}) {
	const isValid = value.startsWith("http://") || value.startsWith("https://");

	return (
		<span className="flex w-full items-center gap-1">
			<input
				type="url"
				value={value}
				onChange={(e) => onChange(e.target.value)}
				placeholder={placeholder}
				className="min-w-0 flex-1 rounded border border-(--re-border) bg-transparent px-1.5 py-1 text-xs placeholder:text-(--re-text-muted)"
			/>
			{isValid && (
				<a
					href={value}
					target="_blank"
					rel="noopener noreferrer"
					title="Open link"
					className="shrink-0 text-(--re-text-muted) hover:text-(--re-text) transition-colors"
				>
					{/* external-link icon via SVG */}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="12"
						height="12"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
						<polyline points="15 3 21 3 21 9" />
						<line x1="10" y1="14" x2="21" y2="3" />
					</svg>
				</a>
			)}
		</span>
	);
}
