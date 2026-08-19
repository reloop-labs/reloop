import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { useRef } from "react";
import type { AiAttachment, AiMode } from "./types";

export function AiComposer({
	value,
	onChange,
	onSend,
	onStop,
	isRunning,
	attachments,
	onAddFiles,
	onRemoveAttachment,
	uploading,
	disabled,
}: {
	mode?: AiMode;
	onModeChange?: (m: AiMode) => void;
	value: string;
	onChange: (v: string) => void;
	onSend: () => void;
	onStop: () => void;
	isRunning: boolean;
	attachments: AiAttachment[];
	onAddFiles: (files: FileList | File[]) => void;
	onRemoveAttachment: (id: string) => void;
	uploading?: boolean;
	disabled?: boolean;
}) {
	const fileRef = useRef<HTMLInputElement>(null);
	const canSend =
		(value.trim().length > 0 || attachments.length > 0) &&
		!isRunning &&
		!uploading &&
		!disabled;

	const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			if (canSend) onSend();
		}
	};

	const onPaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
		const items = e.clipboardData?.items;
		if (!items) return;
		const files: File[] = [];
		for (const item of Array.from(items)) {
			if (item.kind === "file" && item.type.startsWith("image/")) {
				const file = item.getAsFile();
				if (file) files.push(file);
			}
		}
		if (files.length > 0) {
			e.preventDefault();
			void onAddFiles(files);
		}
	};

	return (
		<div className="shrink-0 p-3">
			{attachments.length > 0 ? (
				<div className="mb-2 space-y-1.5">
					<div className="flex flex-wrap gap-1.5">
						{attachments.map((a) => (
							<div
								key={a.id}
								className="group relative h-12 w-12 overflow-hidden rounded-lg border border-stroke-soft-100 dark:border-stroke-soft-100/40"
							>
								<img
									src={a.previewUrl || a.url}
									alt={a.name}
									className="h-full w-full object-cover"
								/>
								<button
									type="button"
									onClick={() => onRemoveAttachment(a.id)}
									className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100"
									aria-label={`Remove ${a.name}`}
								>
									<Icon name="cross" className="h-3.5 w-3.5 text-white" />
								</button>
							</div>
						))}
					</div>
				</div>
			) : null}

			<div
				className={cn(
					"relative flex flex-col rounded-xl border border-stroke-soft-200 bg-bg-weak-50/70 transition-all focus-within:border-stroke-strong-950/20 focus-within:bg-bg-weak-50 focus-within:ring-1 focus-within:ring-stroke-strong-950/10 dark:border-stroke-soft-100/40 dark:bg-white/[0.03] dark:focus-within:border-white/20",
				)}
				onDragOver={(e) => {
					e.preventDefault();
				}}
				onDrop={(e) => {
					e.preventDefault();
					if (e.dataTransfer.files?.length) {
						void onAddFiles(e.dataTransfer.files);
					}
				}}
			>
				<textarea
					rows={3}
					value={value}
					onChange={(e) => onChange(e.target.value)}
					onKeyDown={onKeyDown}
					onPaste={onPaste}
					placeholder="Ask AI to design, edit or style..."
					disabled={isRunning}
					className="w-full resize-none bg-transparent px-3.5 pt-3 pb-2 text-paragraph-xs text-text-strong-950 outline-none placeholder:text-text-soft-400 disabled:opacity-60"
				/>
				<div className="flex items-center justify-between gap-2 px-2.5 pb-2.5">
					<div className="flex items-center gap-1.5">
						<input
							ref={fileRef}
							type="file"
							accept="image/*"
							multiple
							className="hidden"
							onChange={(e) => {
								if (e.target.files?.length) {
									void onAddFiles(e.target.files);
									e.target.value = "";
								}
							}}
						/>
						<button
							type="button"
							disabled={isRunning || uploading}
							onClick={() => fileRef.current?.click()}
							title="Attach screenshot or image"
							className="flex h-7 w-7 items-center justify-center rounded-lg text-text-sub-600 transition-colors hover:bg-bg-weak-100 hover:text-text-strong-950 disabled:opacity-40 dark:hover:bg-white/10"
						>
							<Icon name="image-upload" className="h-4 w-4" />
						</button>
					</div>
					{isRunning ? (
						<Button.Root
							type="button"
							variant="neutral"
							mode="stroke"
							size="xxsmall"
							onClick={onStop}
							className="rounded-lg text-xs"
						>
							Stop
						</Button.Root>
					) : (
						<button
							type="button"
							disabled={!canSend}
							onClick={onSend}
							className={cn(
								"flex h-7 w-7 items-center justify-center rounded-lg transition-all",
								canSend
									? "bg-text-strong-950 text-bg-white-0 shadow-sm hover:opacity-90 dark:bg-white dark:text-black"
									: "text-text-disabled-300 opacity-40",
							)}
							title="Send"
						>
							<Icon name="send" className="h-3.5 w-3.5" />
						</button>
					)}
				</div>
			</div>
		</div>
	);
}
