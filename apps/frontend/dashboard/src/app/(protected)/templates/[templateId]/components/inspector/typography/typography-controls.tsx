import { AlignControls, type Alignment } from "./align-controls";
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
	alignment: Alignment;
	setAlignment: (alignment: Alignment) => void;
}) {
	return (
		<div className="flex flex-col gap-2 px-4 pb-4 pt-2">
			{/* Format marks */}
			<MarkControls marks={marks} toggleMark={toggleMark} />

			{/* Alignment */}
			<AlignControls alignment={alignment} setAlignment={setAlignment} />
		</div>
	);
}
