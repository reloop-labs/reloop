"use client";

import { CopyCodeBlock } from "@reloop/ui/copy-code-block";
import { Icon } from "@reloop/ui/icon";
import { siCursor } from "simple-icons";

export function AiPromptBlock({
	prompt,
	className,
}: {
	prompt: string;
	className?: string;
}) {
	const handleOpenInCursor = () => {
		window.open(`cursor://?prompt=${encodeURIComponent(prompt)}`, "_blank");
	};

	return (
		<CopyCodeBlock
			code={prompt}
			lang="markdown"
			copyValue={prompt}
			title="AI prompt"
			icon={
				<Icon
					name="sparkling"
					className="h-4 w-4 shrink-0 text-text-strong-950 dark:text-white"
				/>
			}
			action={
				<button
					type="button"
					onClick={handleOpenInCursor}
					className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-stroke-soft-100 bg-bg-white-0 px-2.5 py-1 font-medium text-[12px] text-text-sub-600 transition-colors hover:border-stroke-sub-300 hover:text-text-strong-950 dark:border-stroke-soft-100/40 dark:bg-transparent dark:hover:text-white"
				>
					<svg
						role="img"
						viewBox="0 0 24 24"
						className="h-3.5 w-3.5 shrink-0"
						fill="currentColor"
						xmlns="http://www.w3.org/2000/svg"
						aria-hidden
					>
						<path d={siCursor.path} />
					</svg>
					Open in Cursor
				</button>
			}
			hideLineNumbers={false}
			noScroll
			maxHeight="240px"
			className={className}
		/>
	);
}
