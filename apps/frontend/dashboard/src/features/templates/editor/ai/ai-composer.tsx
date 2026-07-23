import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import { useRef } from "react";
import type { AiAttachment, AiMode } from "./types";

const EXAMPLES = [
	"Welcome email for a SaaS free trial with a clear CTA",
	"Order confirmation with {{order_number}} and line items",
	"Product launch announcement — bold headline, one image slot",
];

export function AiComposer({
	mode,
	onModeChange,
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
	mode: AiMode;
	onModeChange: (m: AiMode) => void;
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
	const canSend = value.trim().length > 0 && !isRunning && !uploading && !disabled;

	const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
			e.preventDefault();
			if (canSend) onSend();
		}
	};

	return (
		<div className="shrink-0 border-stroke-soft-200 border-t bg-bg-white-0 p-3 dark:border-stroke-soft-100/40">
			{/* Mode toggle */}
			<div className="mb-2 flex items-center gap-1 rounded-xl bg-bg-weak-50 p-0.5">
				{(
					[
						{ id: "agent" as const, label: "Agent" },
						{ id: "plan" as const, label: "Plan" },
					] as const
				).map((opt) => (
					<button
						key={opt.id}
						type="button"
						onClick={() => onModeChange(opt.id)}
						className={cn(
							"flex-1 rounded-lg py-1.5 font-semibold text-[11px] transition-colors",
							mode === opt.id
								? "bg-bg-white-0 text-text-strong-950 shadow-regular-xs"
								: "text-text-sub-600 hover:text-text-strong-950",
						)}
					>
						{opt.label}
					</button>
				))}
			</div>

			{attachments.length > 0 ? (
				<div className="mb-2 flex flex-wrap gap-1.5">
					{attachments.map((a) => (
						<div
							key={a.id}
							className="group relative h-12 w-12 overflow-hidden rounded-lg border border-stroke-soft-100"
						>
							<img
								src={a.previewUrl || a.url}
								alt={a.name}
								className="h-full w-full object-cover"
							/>
							<button
								type="button"
								onClick={() => onRemoveAttachment(a.id)}
								className="absolute inset-0 flex items-center justify-center bg-bg-strong-950/50 opacity-0 transition-opacity group-hover:opacity-100"
								aria-label={`Remove ${a.name}`}
							>
								<Icon name="cross" className="h-3.5 w-3.5 text-static-white" />
							</button>
						</div>
					))}
				</div>
			) : null}

			<div
				className={cn(
					"rounded-2xl border border-stroke-soft-200 bg-bg-weak-50 focus-within:border-stroke-soft-200 focus-within:ring-2 focus-within:ring-neutral-alpha-10 dark:border-stroke-soft-100/40",
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
					placeholder={
						mode === "plan"
							? "Describe the email — I'll plan steps first…"
							: "Message the agent — e.g. welcome email with CTA…"
					}
					disabled={isRunning}
					className="w-full resize-none bg-transparent px-3 pt-3 pb-1 text-paragraph-xs text-text-strong-950 outline-none placeholder:text-text-soft-400 disabled:opacity-60"
				/>
				<div className="flex items-center justify-between gap-2 px-2 pb-2">
					<div className="flex items-center gap-1">
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
						<Button.Root
							type="button"
							variant="neutral"
							mode="ghost"
							size="xxsmall"
							disabled={isRunning || uploading}
							onClick={() => fileRef.current?.click()}
							title="Attach image"
							className="h-7 w-7 p-0"
						>
							<Icon name="image-upload" className="h-3.5 w-3.5" />
						</Button.Root>
						<span className="hidden text-[10px] text-text-soft-400 sm:inline">
							⌘↵ to send
						</span>
					</div>
					{isRunning ? (
						<Button.Root
							type="button"
							variant="neutral"
							mode="stroke"
							size="xsmall"
							onClick={onStop}
						>
							Stop
						</Button.Root>
					) : (
						<FancyButton.Root
							type="button"
							variant="neutral"
							size="xsmall"
							disabled={!canSend}
							onClick={onSend}
							className="gap-1.5"
						>
							<FancyButton.Icon as={Icon} name="send" />
							{mode === "plan" ? "Plan" : "Send"}
						</FancyButton.Root>
					)}
				</div>
			</div>

			{/* Example chips when empty */}
			{!value.trim() && attachments.length === 0 ? (
				<div className="mt-2 flex flex-col gap-1">
					{EXAMPLES.map((ex) => (
						<button
							key={ex}
							type="button"
							onClick={() => onChange(ex)}
							className="rounded-lg px-2 py-1.5 text-left text-[11px] text-text-soft-400 transition-colors hover:bg-bg-weak-50 hover:text-text-sub-600"
						>
							{ex}
						</button>
					))}
				</div>
			) : null}
		</div>
	);
}
