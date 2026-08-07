import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import * as Modal from "@reloop/ui/modal";
import { useEffect, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import {
	LABEL_COLORS,
	resolveLabelColor,
} from "#/features/agent-inbox/lib/label-colors";
import { ActionKbd } from "#/features/dashboard/keyboard-shortcuts-reveal";

const actionKbdOnBlueClassName =
	"w-auto min-w-4 border-white/25 bg-white/15 px-1 text-white shadow-[0_1.5px_0_0_rgba(0,0,0,0.2)] dark:border-white/25 dark:bg-white/15 dark:text-white dark:shadow-[0_1.5px_0_0_rgba(0,0,0,0.35)]";

export const InboxLabelDialog = ({
	open,
	onOpenChange,
	onSubmit,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSubmit: (name: string, color: string) => void | Promise<void>;
}) => {
	const [name, setName] = useState("");
	const [color, setColor] = useState<string>(LABEL_COLORS[0].hex);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!open) {
			setName("");
			setColor(LABEL_COLORS[0].hex);
			setIsSubmitting(false);
			setError(null);
		}
	}, [open]);

	const trimmed = name.trim();
	const previewColor = resolveLabelColor(color);

	const handleSubmit = async (e?: React.FormEvent) => {
		e?.preventDefault();
		if (isSubmitting) return;

		if (!trimmed) {
			setError("Enter a label name");
			return;
		}

		setError(null);
		setIsSubmitting(true);
		try {
			await onSubmit(trimmed, color);
			onOpenChange(false);
		} finally {
			setIsSubmitting(false);
		}
	};

	useHotkeys(
		"mod+enter",
		(e) => {
			e.preventDefault();
			if (!open || isSubmitting) return;
			void handleSubmit();
		},
		{ enableOnFormTags: ["INPUT"], enabled: open },
		[open, isSubmitting, trimmed, color],
	);

	const modKey =
		typeof navigator !== "undefined" &&
		/Mac|iPhone|iPod|iPad/i.test(navigator.platform)
			? "⌘"
			: "Ctrl";

	return (
		<Modal.Root open={open} onOpenChange={onOpenChange}>
			<Modal.Content
				className="overflow-hidden rounded-3xl border border-mail-border/40 p-0 sm:max-w-[400px]"
				showClose={false}
				aria-describedby={undefined}
				onEscapeKeyDown={(e) => {
					if (isSubmitting) e.preventDefault();
				}}
				onPointerDownOutside={(e) => {
					if (isSubmitting) e.preventDefault();
				}}
			>
				<form onSubmit={(e) => void handleSubmit(e)}>
					<div className="flex items-start justify-between border-mail-border/40 border-b px-5 pt-5 pb-4">
						<div className="flex flex-col gap-1">
							<div className="flex items-center gap-2.5">
								<Icon name="tag" className="h-4 w-4 text-mail-foreground" />
								<Modal.Title asChild>
									<h2 className="font-semibold text-label-md text-mail-foreground">
										Create label
									</h2>
								</Modal.Title>
							</div>
							<p className="pl-[26px] text-[12px] text-mail-muted leading-snug">
								Tag and filter messages in this mailbox.
							</p>
						</div>
						<button
							type="button"
							onClick={() => onOpenChange(false)}
							disabled={isSubmitting}
							className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-transparent text-mail-muted transition-transform duration-150 ease-out hover:bg-[var(--inbox-hover)] hover:text-mail-foreground active:scale-[0.95] disabled:opacity-50"
							aria-label="Close"
						>
							<Icon name="cross" className="h-3.5 w-3.5" />
						</button>
					</div>

					<Modal.Body className="space-y-5 px-5 py-5">
						<div className="flex flex-col gap-1.5">
							<label
								htmlFor="inbox-label-name"
								className="font-medium text-label-sm text-mail-foreground"
							>
								Label preview
							</label>
							<div
								className={cn(
									"flex items-center gap-2.5 rounded-2xl border bg-[var(--inbox-hover)] px-3.5 py-2.5 focus-within:ring-2",
									error
										? "border-error-base focus-within:ring-error-base/20"
										: "border-mail-border/40 focus-within:border-mail-primary/40 focus-within:ring-mail-primary/15",
								)}
							>
								<span
									className="size-2.5 shrink-0 rounded-full"
									style={{ backgroundColor: previewColor }}
									aria-hidden
								/>
								<input
									id="inbox-label-name"
									value={name}
									onChange={(e) => {
										setName(e.target.value);
										if (error) setError(null);
									}}
									placeholder="Type a name…"
									autoFocus
									maxLength={40}
									disabled={isSubmitting}
									aria-invalid={!!error}
									aria-describedby={
										error ? "inbox-label-name-error" : undefined
									}
									className="min-w-0 flex-1 border-0 bg-transparent p-0 font-medium text-[13px] text-mail-foreground outline-none placeholder:text-mail-muted disabled:opacity-50"
								/>
							</div>
							{error && (
								<p
									id="inbox-label-name-error"
									className="text-[12px] text-error-base leading-snug"
									role="alert"
								>
									{error}
								</p>
							)}
						</div>

						<div className="flex flex-col gap-2">
							<span className="font-medium text-label-sm text-mail-foreground">
								Color
							</span>
							<div
								className="flex flex-wrap gap-2"
								role="radiogroup"
								aria-label="Label color"
							>
								{LABEL_COLORS.map((option) => {
									const selected = color === option.hex;
									return (
										<button
											key={option.id}
											type="button"
											role="radio"
											aria-checked={selected}
											aria-label={option.label}
											title={option.label}
											disabled={isSubmitting}
											onClick={() => setColor(option.hex)}
											className={cn(
												"flex size-7 items-center justify-center rounded-full transition-transform duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mail-primary/40 active:scale-[0.97] disabled:opacity-50",
												selected &&
													"ring-2 ring-mail-foreground/20 ring-offset-2 ring-offset-panel-light dark:ring-offset-panel-dark",
											)}
										>
											<span
												className="size-4 rounded-full"
												style={{ backgroundColor: option.hex }}
											/>
										</button>
									);
								})}
							</div>
						</div>
					</Modal.Body>

					<div className="flex items-center justify-end gap-2 border-mail-border/40 border-t px-5 py-4">
						<Button.Root
							type="button"
							variant="neutral"
							mode="stroke"
							size="xsmall"
							disabled={isSubmitting}
							onClick={() => onOpenChange(false)}
						>
							Cancel
							<span className="flex h-[19px] w-7 items-center justify-center rounded-[5px] border border-mail-border bg-offset-light/50 p-px font-medium text-[10px]">
								Esc
							</span>
						</Button.Root>
						<FancyButton.Root
							type="submit"
							variant="neutral"
							size="xsmall"
							disabled={isSubmitting}
							className="min-w-[148px] pr-14"
						>
							<span className="text-sm leading-none">
								{isSubmitting ? "Creating…" : "Create label"}
							</span>
							{!isSubmitting && (
								<div className="absolute top-1/2 right-2.5 z-20 flex -translate-y-1/2 items-center gap-0.5 opacity-90">
									<ActionKbd className={actionKbdOnBlueClassName}>
										{modKey}
									</ActionKbd>
									<ActionKbd className={actionKbdOnBlueClassName}>↵</ActionKbd>
								</div>
							)}
						</FancyButton.Root>
					</div>
				</form>
			</Modal.Content>
		</Modal.Root>
	);
};
