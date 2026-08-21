import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as Popover from "@reloop/ui/popover";
import {
	type KeyboardEvent,
	type ReactNode,
	useEffect,
	useRef,
	useState,
} from "react";

export type AiComposeTone = "default" | "formal" | "casual" | "concise";

const TONE_OPTIONS: { value: AiComposeTone; label: string }[] = [
	{ value: "default", label: "Default" },
	{ value: "formal", label: "Formal" },
	{ value: "casual", label: "Casual" },
	{ value: "concise", label: "Concise" },
];

export const TONE_PROMPTS: Record<AiComposeTone, string> = {
	default: "",
	formal: "formal",
	casual: "casual and friendly",
	concise: "concise",
};

interface AiPromptPopoverProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	/** Element the popover anchors to (the Write with AI button). */
	children: ReactNode;
	/** Whether subject/recipients exist so an empty prompt still generates. */
	hasContext: boolean;
	onSubmit: (input: { prompt: string; tone: AiComposeTone }) => void;
}

/**
 * Inline prompt surface for "Write with AI" when the body is empty.
 * Prompt is optional — generation falls back to subject + recipients context.
 */
export const AiPromptPopover = ({
	open,
	onOpenChange,
	children,
	hasContext,
	onSubmit,
}: AiPromptPopoverProps) => {
	const [prompt, setPrompt] = useState("");
	const [tone, setTone] = useState<AiComposeTone>("default");
	const inputRef = useRef<HTMLTextAreaElement>(null);

	useEffect(() => {
		if (open) {
			window.setTimeout(() => inputRef.current?.focus(), 20);
		}
	}, [open]);

	const trimmed = prompt.trim();
	const canSubmit = Boolean(trimmed) || hasContext;

	const submit = () => {
		if (!canSubmit) return;
		onOpenChange(false);
		setPrompt("");
		onSubmit({ prompt: trimmed, tone });
	};

	const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			submit();
		}
	};

	return (
		<Popover.Root open={open} onOpenChange={onOpenChange}>
			<Popover.Anchor>{children}</Popover.Anchor>
			<Popover.Content
				align="end"
				side="top"
				sideOffset={8}
				showArrow={false}
				onOpenAutoFocus={(e) => e.preventDefault()}
				className="z-[100] w-[340px] rounded-2xl border border-mail-border/40 bg-panel-light p-3 shadow-lg dark:bg-panel-dark"
			>
				<textarea
					ref={inputRef}
					value={prompt}
					onChange={(e) => setPrompt(e.target.value)}
					onKeyDown={handleKeyDown}
					rows={2}
					placeholder={
						hasContext
							? "What should this email say? Leave empty to write from the subject & recipients."
							: "What should this email say?"
					}
					className="w-full resize-none rounded-lg border border-mail-border/50 bg-transparent px-2.5 py-2 text-[13px] text-mail-foreground placeholder:text-mail-muted focus:border-mail-border focus:outline-none"
				/>
				<div className="mt-2 flex items-center justify-between gap-2">
					<div className="flex items-center gap-1">
						{TONE_OPTIONS.map((option) => (
							<button
								key={option.value}
								type="button"
								onClick={() => setTone(option.value)}
								className={cn(
									"h-6 rounded-md px-2 text-[11px] font-medium transition-colors duration-150 ease-out",
									tone === option.value
										? "bg-mail-foreground text-panel-light dark:bg-panel-light dark:text-mail-foreground"
										: "text-mail-muted hover:bg-[var(--inbox-hover)] hover:text-mail-foreground",
								)}
							>
								{option.label}
							</button>
						))}
					</div>
					<button
						type="button"
						onClick={submit}
						disabled={!canSubmit}
						className="inline-flex h-7 items-center gap-1.5 rounded-lg bg-mail-foreground px-2.5 text-[12px] font-medium text-panel-light transition-transform duration-150 ease-out hover:opacity-90 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 dark:bg-panel-light dark:text-mail-foreground"
					>
						<Icon name="magic-wand" className="h-3 w-3 shrink-0" />
						Generate
					</button>
				</div>
			</Popover.Content>
		</Popover.Root>
	);
};
