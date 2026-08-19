import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { useRef, useState } from "react";

export function PromptBox({
	prompt,
	setPrompt,
	onSubmit,
	isSubmitting,
}: {
	prompt: string;
	setPrompt: (p: string) => void;
	onSubmit: () => void;
	isSubmitting: boolean;
}) {
	const fileRef = useRef<HTMLInputElement>(null);
	const [attachments, setAttachments] = useState<File[]>([]);

	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			if (prompt.trim().length > 0 && !isSubmitting) {
				onSubmit();
			}
		}
	};

	const handleAddFiles = (files: FileList | null) => {
		if (!files) return;
		const next = Array.from(files);
		setAttachments((prev) => [...prev, ...next]);
	};

	return (
		<div className="flex w-full justify-center">
			<div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white/95 shadow-[0px_106px_43px_0px_rgba(0,0,0,0.01),0px_60px_36px_0px_rgba(0,0,0,0.03),0px_27px_27px_0px_rgba(0,0,0,0.04),0px_7px_15px_0px_rgba(0,0,0,0.05)] ring-1 ring-black/5 backdrop-blur-md dark:bg-[#151515] dark:ring-white/10">
				<div className="flex w-full flex-col">
					{/* Attachments preview */}
					{attachments.length > 0 && (
						<div className="flex flex-wrap gap-2 px-5 pt-3">
							{attachments.map((file, idx) => (
								<div
									key={idx}
									className="flex items-center gap-1.5 rounded-full border border-stroke-soft-200 bg-bg-weak-50 px-2.5 py-1 text-text-strong-950 text-xs dark:border-white/10 dark:bg-white/5"
								>
									<Icon name="image-upload" className="h-3 w-3 opacity-60" />
									<span className="max-w-[120px] truncate">{file.name}</span>
									<button
										type="button"
										onClick={() =>
											setAttachments((prev) => prev.filter((_, i) => i !== idx))
										}
										className="ml-0.5 text-text-soft-400 hover:text-text-strong-950"
									>
										<Icon name="cross" className="h-2.5 w-2.5" />
									</button>
								</div>
							))}
						</div>
					)}

					{/* Textarea */}
					<div className="flex min-h-12 items-center pt-4 pr-7 pb-2 pl-5">
						<textarea
							autoComplete="off"
							data-1p-ignore="true"
							data-lpignore="true"
							data-bwignore="true"
							data-form-type="other"
							style={{ minHeight: "36px" }}
							rows={1}
							value={prompt}
							onChange={(e) => setPrompt(e.target.value)}
							onKeyDown={handleKeyDown}
							placeholder="Describe what you want to build…"
							disabled={isSubmitting}
							className="z-40 w-full resize-none border-0 bg-transparent p-0 text-base text-text-strong-950 caret-primary-base outline-none [scrollbar-width:none] placeholder:text-text-soft-400 focus:outline-none focus:ring-0 disabled:opacity-60 [&::-webkit-scrollbar]:hidden"
						/>
					</div>

					{/* Bottom Actions Row */}
					<div className="flex items-center justify-between p-2.5">
						<div className="flex min-w-0 items-center">
							<input
								ref={fileRef}
								type="file"
								accept="image/*"
								multiple
								className="hidden"
								onChange={(e) => {
									handleAddFiles(e.target.files);
									e.target.value = "";
								}}
							/>
							<button
								type="button"
								onClick={() => fileRef.current?.click()}
								className="group inline-flex h-8 cursor-pointer flex-row-reverse items-center justify-center gap-1 rounded-full px-3.5 text-sm text-text-strong-950 tracking-[-0.01em] transition hover:bg-black/5 dark:hover:bg-white/10"
							>
								<span>Upload image</span>
								<svg
									width="20"
									height="20"
									viewBox="0 0 24 24"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
									className="size-4"
									aria-hidden="true"
								>
									<path
										d="M7 9V16C7 18.7614 9.23858 21 12 21C14.7614 21 17 18.7614 17 16V5.5C17 4.11929 15.8807 3 14.5 3C13.1193 3 12 4.11929 12 5.5V15"
										stroke="currentColor"
										strokeWidth="1.5"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
								</svg>
							</button>
						</div>

						{/* Submit button */}
						<button
							type="button"
							disabled={!prompt.trim() || isSubmitting}
							onClick={onSubmit}
							aria-label="Create template"
							className={cn(
								"group inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full transition disabled:pointer-events-none disabled:opacity-40",
								prompt.trim() && !isSubmitting
									? "bg-text-strong-950 text-white hover:opacity-90 dark:bg-white dark:text-black"
									: "bg-black/10 text-text-disabled-300 dark:bg-white/10",
							)}
						>
							{isSubmitting ? (
								<div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
							) : (
								<svg
									width="20"
									height="20"
									viewBox="0 0 24 24"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
									className="size-4"
									aria-hidden="true"
								>
									<path
										d="M18.5 11.5L11.5 4.5M11.5 4.5L4.5 11.5M11.5 4.5L11.5 21.5"
										stroke="currentColor"
										strokeWidth="1.5"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
								</svg>
							)}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
