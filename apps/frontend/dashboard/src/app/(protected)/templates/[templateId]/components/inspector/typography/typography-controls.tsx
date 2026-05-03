import { AlignControls } from "./align-controls";
import { ListControls } from "./list-controls";
import { MarkControls } from "./mark-controls";

/* ------------------------------------------------------------------ */
/* Typography Controls - Pill style formatting + alignment             */
/* ------------------------------------------------------------------ */

export function TypographyControls({
	marks,
	toggleMark,
	alignment,
	setAlignment,
}: {
	marks: Record<string, boolean | undefined>;
	toggleMark: (mark: string) => void;
	alignment: string;
	setAlignment: (alignment: string) => void;
}) {
	return (
		<div className="flex flex-col gap-3 px-4 pt-2 pb-4">
			<MarkControls marks={marks} toggleMark={toggleMark} />
			<ListControls />
			<AlignControls alignment={alignment} setAlignment={setAlignment} />
		</div>
	);
}
