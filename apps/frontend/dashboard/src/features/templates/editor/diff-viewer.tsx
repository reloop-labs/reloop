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
		<div className="flex h-full flex-col bg-zinc-950 font-sans">
			{/* Subject Diff Banner */}
			<div className="border-zinc-850 border-b bg-zinc-900/50 p-4">
				<div className="flex flex-col gap-2">
					<div className="flex items-center gap-2">
						<Icon name="info-outline" className="size-4 text-zinc-400" />
						<span className="font-semibold text-xs text-zinc-300">
							Subject Line Comparison
						</span>
					</div>
					<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
						<div className="rounded-lg border border-red-500/20 bg-red-950/20 p-3">
							<span className="font-bold text-[10px] text-red-400 uppercase tracking-wider">
								Previous
							</span>
							<p className="mt-1 break-words font-mono text-red-300 text-xs">
								{oldSubject || "(No subject set)"}
							</p>
						</div>
						<div className="rounded-lg border border-emerald-500/20 bg-emerald-950/20 p-3">
							<span className="font-bold text-[10px] text-emerald-400 uppercase tracking-wider">
								Current
							</span>
							<p className="mt-1 break-words font-mono text-emerald-300 text-xs">
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
					<div className="flex h-full min-h-[250px] flex-col overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/20">
						<div className="flex items-center justify-between border-zinc-800 border-b bg-zinc-900/60 px-4 py-2">
							<span className="font-semibold text-xs text-zinc-400">
								Previously Published
							</span>
							<span className="rounded bg-zinc-800 px-1.5 py-0.5 font-bold font-mono text-[10px] text-zinc-500">
								Old
							</span>
						</div>
						<div className="relative flex-1 bg-white">
							{oldHtml ? (
								<iframe
									srcDoc={oldHtml}
									title="Previously Published Template Preview"
									className="absolute inset-0 size-full border-0"
									sandbox="allow-popups-to-escape-sandbox allow-same-origin"
								/>
							) : (
								<div className="absolute inset-0 flex items-center justify-center bg-zinc-900 text-xs text-zinc-500">
									No previously published version
								</div>
							)}
						</div>
					</div>

					{/* Right Frame: Current Edits */}
					<div className="flex h-full min-h-[250px] flex-col overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/20">
						<div className="flex items-center justify-between border-zinc-800 border-b bg-zinc-900/60 px-4 py-2">
							<span className="font-semibold text-xs text-zinc-300">
								Current Edits (To Publish)
							</span>
							<span className="rounded border border-emerald-500/25 bg-emerald-950/40 px-1.5 py-0.5 font-bold font-mono text-[10px] text-emerald-400">
								New
							</span>
						</div>
						<div className="relative flex-1 bg-white">
							{newHtml ? (
								<iframe
									srcDoc={newHtml}
									title="Current Edits Template Preview"
									className="absolute inset-0 size-full border-0"
									sandbox="allow-popups-to-escape-sandbox allow-same-origin"
								/>
							) : (
								<div className="absolute inset-0 flex items-center justify-center bg-zinc-900 text-xs text-zinc-500">
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
