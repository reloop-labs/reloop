"use client";

import { cn } from "@reloop/ui/cn";
import { useEffect, useState } from "react";

interface Channel {
	id: string;
	name: string;
	description: string | null;
	defaultSubscription?: "opt_in" | "opt_out";
	visibility?: "private" | "public";
}

interface SubscriberPreviewProps {
	channels: Channel[];
	orgName?: string;
}

function Checkbox({
	checked,
	onChange,
}: {
	checked: boolean;
	onChange: (v: boolean) => void;
}) {
	return (
		<button
			type="button"
			role="checkbox"
			aria-checked={checked}
			onClick={() => onChange(!checked)}
			className={cn(
				"flex h-4 w-4 flex-shrink-0 items-center justify-center rounded transition-all duration-150",
				checked
					? "bg-white"
					: "border border-white/25 bg-transparent hover:border-white/50",
			)}
		>
			{checked && (
				<svg
					className="h-2.5 w-2.5 text-black"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					strokeWidth={3}
				>
					<path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
				</svg>
			)}
		</button>
	);
}

export function SubscriberPreview({
	channels,
	orgName = "Your Organization",
}: SubscriberPreviewProps) {
	// Only show public channels in the preview
	const publicChannels = channels.filter((t) => t.visibility === "public");

	const buildInitialStates = () =>
		Object.fromEntries(
			publicChannels.map((t) => [t.id, t.defaultSubscription === "opt_in"]),
		);

	const [checked, setChecked] = useState<Record<string, boolean>>(buildInitialStates);
	const [saved, setSaved] = useState(false);

	// Reset when channels change
	useEffect(() => {
		setChecked(buildInitialStates());
		setSaved(false);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [channels.map((t) => t.id).join(",")]);

	const handleUpdate = () => {
		setSaved(true);
		setTimeout(() => setSaved(false), 2000);
	};

	const handleUnsubscribeAll = () => {
		setChecked(Object.fromEntries(publicChannels.map((t) => [t.id, false])));
	};

	return (
		<div>
			{/* Header */}
			<div className="mb-3 flex items-center justify-between">
				<div className="flex items-center gap-2">
					<span className="font-medium text-xs text-text-strong-950">
						Subscriber Preview
					</span>
					<span className="rounded-md border border-stroke-soft-200 bg-neutral-alpha-10 px-1.5 py-0.5 font-medium text-[10px] text-text-sub-600">
						Interactive
					</span>
				</div>
				<span className="text-[10px] text-text-sub-600">
					{publicChannels.length} public channel{publicChannels.length !== 1 ? "s" : ""}
				</span>
			</div>

			{/* Phone-style dark card */}
			<div className="relative overflow-hidden rounded-2xl bg-[#111113] p-5 shadow-lg">
				{/* Customize page button */}
				<button
					type="button"
					className="absolute right-3 top-3 flex items-center gap-1.5 rounded-lg bg-white/8 px-2.5 py-1.5 font-medium text-[10px] text-white/60 transition-colors hover:bg-white/12 hover:text-white/80"
				>
					<svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
						/>
					</svg>
					Customize page
				</button>

				{/* Check icon */}
				<div className="mb-5 mt-2 flex justify-center">
					<div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15">
						<svg
							className="h-4 w-4 text-white"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							strokeWidth={2.5}
						>
							<path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
						</svg>
					</div>
				</div>

				{/* Heading */}
				<div className="mb-5 text-center">
					<h2 className="font-bold text-lg leading-tight text-white">
						Do you want to
						<br />
						unsubscribe?
					</h2>
					<p className="mt-2 text-sm text-white/50">Confirm your email preferences:</p>
				</div>

				{/* Channels list */}
				{publicChannels.length === 0 ? (
					<div className="mb-5 flex flex-col items-center gap-2 rounded-xl border border-dashed border-white/10 py-6 text-center">
						<p className="text-[11px] text-white/30">
							No public channels yet.
							<br />
							Set a channel to Public to show it here.
						</p>
					</div>
				) : (
					<div className="mb-5 space-y-1">
						{publicChannels.map((channel) => (
							<button
								key={channel.id}
								type="button"
								onClick={() =>
									setChecked((prev) => ({ ...prev, [channel.id]: !prev[channel.id] }))
								}
								className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-white/5"
							>
								<Checkbox
									checked={checked[channel.id] ?? false}
									onChange={(val) =>
										setChecked((prev) => ({ ...prev, [channel.id]: val }))
									}
								/>
								<div className="min-w-0">
									<p className="font-medium text-sm text-white leading-4">{channel.name}</p>
									{channel.description && (
										<p className="mt-0.5 truncate text-[11px] text-white/40">
											{channel.description}
										</p>
									)}
								</div>
							</button>
						))}
					</div>
				)}

				{/* Update button */}
				<button
					type="button"
					onClick={handleUpdate}
					className={cn(
						"w-full rounded-xl py-2.5 font-semibold text-sm transition-all duration-200",
						saved
							? "bg-green-500/20 text-green-400"
							: "bg-white text-black hover:bg-white/90 active:scale-[0.98]",
					)}
				>
					{saved ? "✓ Updated!" : "Update"}
				</button>

				{/* Or divider */}
				<div className="my-3 flex items-center gap-3">
					<div className="h-px flex-1 bg-white/10" />
					<span className="text-[11px] text-white/30">Or</span>
					<div className="h-px flex-1 bg-white/10" />
				</div>

				{/* Unsubscribe All button */}
				<button
					type="button"
					onClick={handleUnsubscribeAll}
					className="w-full rounded-xl border border-white/15 py-2.5 font-semibold text-sm text-white transition-all hover:bg-white/5 active:scale-[0.98]"
				>
					Unsubscribe All
				</button>

				{/* Footer */}
				<div className="mt-5 flex items-center justify-center gap-1.5">
					<span className="text-[11px] text-white/25">Powered by</span>
					<div className="flex h-4 w-4 items-center justify-center rounded bg-white/10">
						<svg viewBox="0 0 24 24" className="h-2.5 w-2.5 fill-white/60" aria-hidden="true">
							<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
						</svg>
					</div>
					<span className="font-medium text-[11px] text-white/40">Reloop</span>
				</div>
			</div>
		</div>
	);
}
