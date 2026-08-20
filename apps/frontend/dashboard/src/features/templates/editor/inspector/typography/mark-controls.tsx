import * as ButtonGroup from "@reloop/ui/button-group";

/** Letter glyphs — sprite has no bold/italic/underline icons. */
function Glyph({ children }: { children: React.ReactNode }) {
	return (
		<span className="flex h-4 w-4 items-center justify-center font-semibold text-[12px] leading-none">
			{children}
		</span>
	);
}

export function MarkControls({
	marks,
	toggleMark,
}: {
	marks: Record<string, boolean | undefined>;
	toggleMark: (mark: string) => void;
}) {
	return (
		<ButtonGroup.Root className="w-full">
			<ButtonGroup.Item
				title="Bold"
				aria-label="Bold"
				data-state={marks.bold ? "on" : "off"}
				onClick={() => toggleMark("bold")}
				className="h-10 flex-1 first:rounded-l-xl last:rounded-r-xl"
			>
				<Glyph>
					<span className="font-bold">B</span>
				</Glyph>
			</ButtonGroup.Item>
			<ButtonGroup.Item
				title="Italic"
				aria-label="Italic"
				data-state={marks.italic ? "on" : "off"}
				onClick={() => toggleMark("italic")}
				className="h-10 flex-1 first:rounded-l-xl last:rounded-r-xl"
			>
				<Glyph>
					<span className="font-serif italic">I</span>
				</Glyph>
			</ButtonGroup.Item>
			<ButtonGroup.Item
				title="Underline"
				aria-label="Underline"
				data-state={marks.underline ? "on" : "off"}
				onClick={() => toggleMark("underline")}
				className="h-10 flex-1 first:rounded-l-xl last:rounded-r-xl"
			>
				<Glyph>
					<span className="underline">U</span>
				</Glyph>
			</ButtonGroup.Item>
			<ButtonGroup.Item
				title="Strikethrough"
				aria-label="Strikethrough"
				data-state={marks.strike ? "on" : "off"}
				onClick={() => toggleMark("strike")}
				className="h-10 flex-1 first:rounded-l-xl last:rounded-r-xl"
			>
				<Glyph>
					<span className="line-through">S</span>
				</Glyph>
			</ButtonGroup.Item>
			<ButtonGroup.Item
				title={
					marks.uppercase ? "Uppercase" : marks.lowercase ? "Lowercase" : "Case"
				}
				aria-label="Toggle Case"
				data-state={marks.uppercase || marks.lowercase ? "on" : "off"}
				onClick={() => {
					if (marks.uppercase) {
						toggleMark("uppercase");
						toggleMark("lowercase");
					} else if (marks.lowercase) {
						toggleMark("lowercase");
					} else {
						toggleMark("uppercase");
					}
				}}
				className="h-10 flex-1 first:rounded-l-xl last:rounded-r-xl"
			>
				<Glyph>
					<span className="text-[11px] tracking-tight">Aa</span>
				</Glyph>
			</ButtonGroup.Item>
		</ButtonGroup.Root>
	);
}
