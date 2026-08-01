import { Icon } from "@reloop/ui/icon";

interface DiffViewerProps {
	oldHtml: string;
	newHtml: string;
	oldSubject: string;
	newSubject: string;
	viewportWidth?: string;
}

export function DiffViewer({
	oldHtml,
	newHtml,
	oldSubject,
	newSubject,
	viewportWidth = "100%",
}: DiffViewerProps) {
	return (
		<div className="flex h-full flex-col bg-bg-weak-50 font-sans">
			{/* Subject Diff Banner */}
			<div className="border-stroke-soft-200 border-b bg-bg-white-0 p-4 dark:border-stroke-soft-100/40">
				<div className="flex flex-col gap-2">
					<div className="flex items-center gap-2">
						<Icon name="info-outline" className="size-4 text-text-sub-600" />
						<span className="font-semibold text-label-xs text-text-strong-950">
							Subject Line Comparison
						</span>
					</div>
					<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
						<div className="rounded-lg border border-error-base/20 bg-error-lighter p-3">
							<span className="font-bold text-[10px] text-error-base uppercase tracking-wider">
								Previous
							</span>
							<p className="mt-1 break-words font-mono text-error-dark text-paragraph-xs">
								{oldSubject || "(No subject set)"}
							</p>
						</div>
						<div className="rounded-lg border border-success-base/20 bg-success-lighter p-3">
							<span className="font-bold text-[10px] text-success-base uppercase tracking-wider">
								Current
							</span>
							<p className="mt-1 break-words font-mono text-paragraph-xs text-success-dark">
								{newSubject || "(No subject set)"}
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* HTML Visual Split Previews */}
			<div className="min-h-[300px] flex-1 p-4">
				<div className="grid h-full grid-cols-1 gap-4 lg:grid-cols-2">
					{/* Left Frame: Previous Published */}
					<div className="flex h-full min-h-[250px] flex-col overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-white-0 dark:border-stroke-soft-100/40">
						<div className="flex items-center justify-between border-stroke-soft-200 border-b bg-bg-weak-50 px-4 py-2 dark:border-stroke-soft-100/40">
							<span className="font-semibold text-label-xs text-text-sub-600">
								Previously Published
							</span>
							<span className="rounded-md bg-bg-soft-200 px-1.5 py-0.5 font-bold font-mono text-[10px] text-text-soft-400">
								Old
							</span>
						</div>
						<div className="relative flex-1 bg-bg-white-0">
							{oldHtml ? (
								<iframe
									srcDoc={oldHtml}
									title="Previously Published Template Preview"
									className="absolute inset-0 size-full border-0"
									sandbox="allow-popups-to-escape-sandbox allow-same-origin"
									style={{ width: viewportWidth }}
								/>
							) : (
								<div className="absolute inset-0 flex items-center justify-center bg-bg-weak-50 text-paragraph-xs text-text-soft-400">
									No previously published version
								</div>
							)}
						</div>
					</div>

					{/* Right Frame: Current Edits */}
					<div className="flex h-full min-h-[250px] flex-col overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-white-0 dark:border-stroke-soft-100/40">
						<div className="flex items-center justify-between border-stroke-soft-200 border-b bg-bg-weak-50 px-4 py-2 dark:border-stroke-soft-100/40">
							<span className="font-semibold text-label-xs text-text-strong-950">
								Current Edits (To Publish)
							</span>
							<span className="rounded-md border border-success-base/25 bg-success-lighter px-1.5 py-0.5 font-bold font-mono text-[10px] text-success-base">
								New
							</span>
						</div>
						<div className="relative flex-1 bg-bg-white-0">
							{newHtml ? (
								<iframe
									srcDoc={newHtml}
									title="Current Edits Template Preview"
									className="absolute inset-0 size-full border-0"
									sandbox="allow-popups-to-escape-sandbox allow-same-origin"
									style={{ width: viewportWidth }}
								/>
							) : (
								<div className="absolute inset-0 flex items-center justify-center bg-bg-weak-50 text-paragraph-xs text-text-soft-400">
									Blank template
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
