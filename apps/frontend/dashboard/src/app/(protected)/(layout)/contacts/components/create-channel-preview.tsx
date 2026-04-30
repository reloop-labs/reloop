"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import { useEffect, useState } from "react";

interface Channel {
	id: string;
	name: string;
	description: string | null;
	defaultSubscription?: "opt_in" | "opt_out";
	visibility?: "private" | "public";
}

interface CreateChannelPreviewProps {
	channel: Channel;
	/** Other public channels in the same org to show realistic context */
	siblingChannels?: Channel[];
	orgName?: string;
	contactEmail?: string;
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
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M5 13l4 4L19 7"
					/>
				</svg>
			)}
		</button>
	);
}

export function CreateChannelPreview({
	channel,
	siblingChannels = [],
	orgName = "Your Organization",
	contactEmail = "subscriber@example.com",
}: CreateChannelPreviewProps) {
	// For the creation preview, we ALWAYS show the channel being created at the top,
	// even if it is currently set to 'private'.
	const publicSiblings = siblingChannels.filter(
		(t) => t.id !== channel.id && t.visibility === "public",
	);

	const previewChannels = [channel, ...publicSiblings].slice(0, 5);

	const buildInitialStates = () =>
		Object.fromEntries(
			previewChannels.map((t) => [t.id, t.defaultSubscription === "opt_in"]),
		);

	const [checked, setChecked] = useState<Record<string, boolean>>(
		buildInitialStates(),
	);
	const [saved, setSaved] = useState(false);

	// Reset when channels change
	useEffect(() => {
		setChecked(buildInitialStates());
		setSaved(false);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [previewChannels.map((t) => t.id).join(","), channel.defaultSubscription]);

	const handleUpdate = () => {
		setSaved(true);
		setTimeout(() => setSaved(false), 2000);
	};

	const handleUnsubscribeAll = () => {
		setChecked(Object.fromEntries(previewChannels.map((t) => [t.id, false])));
	};

	return (
		<div className="w-full">
			<div className="relative overflow-hidden rounded-2xl bg-[#111113] p-6 shadow-lg lg:p-8">
				<div className="mt-4 mb-6 flex justify-center">
					<div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15">
						<svg
							className="h-5 w-5 text-white"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							strokeWidth={2.5}
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M5 13l4 4L19 7"
							/>
						</svg>
					</div>
				</div>

				{/* Heading */}
				<div className="mb-6 text-center">
					<h2 className="font-bold text-white text-xl leading-tight">
						Do you want to
						<br />
						unsubscribe?
					</h2>
					<p className="mt-2 text-sm text-white/50">
						Confirm preferences for{" "}
						<span className="text-white/80">{contactEmail}</span>
						<br />
						at <span className="text-white/80">{orgName}</span>:
					</p>
				</div>

				{/* Channels list */}
				<div className="mb-6 space-y-1">
					{previewChannels.map((t) => {
						const isCurrent = t.id === channel.id;
						const isPrivate = t.visibility === "private";

						return (
							<div
								className={cn(
									"rounded-2xl border",
									isCurrent
										? "border-primary-base"
										: "border-transparent hover:bg-white/5",
								)}
							>
								<button
									key={t.id}
									type="button"
									onClick={() =>
										setChecked((prev) => ({ ...prev, [t.id]: !prev[t.id] }))
									}
									className={cn("flex w-full gap-2 px-4 pt-3.5 pb-2 text-left")}
								>
									<Checkbox
										checked={checked[t.id] ?? false}
										onChange={(val) =>
											setChecked((prev) => ({ ...prev, [t.id]: val }))
										}
									/>
									<div className="-mt-px min-w-0 flex-1">
										<div className="flex items-center justify-between gap-2">
											<div className="flex flex-1 items-center justify-between gap-2">
												{t.name ? (
													<p className="font-medium text-sm text-white leading-4">
														{t.name}
													</p>
												) : (
													<Skeleton className="h-3.5 w-32 rounded-md bg-white/10" />
												)}
												{isCurrent && (
													<span className="rounded-full bg-primary-base px-2 py-0.5 font-semibold text-[10px] text-white">
														New
													</span>
												)}
											</div>
										</div>
										{t.description ? (
											<p className="mt-1 mb-2 truncate text-[11px] text-white/40">
												{t.description}
											</p>
										) : (
											isCurrent && (
												<Skeleton className="mt-1 mb-3 h-3 w-48 rounded-md bg-white/5" />
											)
										)}
									</div>
								</button>
								{isCurrent && isPrivate && (
									<div className="flex gap-2 rounded-b-[15px] bg-primary-base px-4 py-2">
										<Icon name="lock" className="h-3.5 w-3.5 text-white/90" />
										<p className="font-medium text-[11px] text-white leading-tight">
											Currently <strong>Private</strong>. Hidden from
											subscribers until set to Public.
										</p>
									</div>
								)}
							</div>
						);
					})}
				</div>

				{/* Update button */}
				<button
					type="button"
					onClick={handleUpdate}
					className={cn(
						"w-full rounded-xl py-3 font-semibold text-sm transition-all duration-200",
						saved
							? "bg-green-500/20 text-green-400"
							: "bg-white text-black hover:bg-white/90 active:scale-[0.98]",
					)}
				>
					{saved ? "✓ Updated!" : "Update"}
				</button>

				{/* Or divider */}
				<div className="my-4 flex items-center gap-3">
					<div className="h-px flex-1 bg-white/10" />
					<span className="text-[11px] text-white/30">Or</span>
					<div className="h-px flex-1 bg-white/10" />
				</div>

				{/* Unsubscribe All button */}
				<button
					type="button"
					onClick={handleUnsubscribeAll}
					className="w-full rounded-xl border border-white/15 py-3 font-semibold text-sm text-white transition-all hover:bg-white/5 active:scale-[0.98]"
				>
					Unsubscribe All
				</button>

				{/* Footer */}
				<div className="mt-6 flex items-center justify-center gap-1.5">
					<span className="text-[11px] text-white/25">Powered by</span>
					<div className="flex h-4 w-4 items-center justify-center rounded bg-white/10">
						<svg
							viewBox="0 0 24 24"
							className="h-2.5 w-2.5 fill-white/60"
							aria-hidden="true"
						>
							<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
						</svg>
					</div>
					<span className="font-medium text-[11px] text-white/40">Reloop</span>
				</div>
			</div>
		</div>
	);
}
