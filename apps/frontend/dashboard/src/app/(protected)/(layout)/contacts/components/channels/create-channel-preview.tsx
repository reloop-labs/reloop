"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { Logo } from "@reloop/ui/logo";
import { Skeleton } from "@reloop/ui/skeleton";
import * as Switch from "@reloop/ui/switch";
import { AnimatePresence, motion } from "framer-motion";
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
	isDarkMode,
}: {
	checked: boolean;
	onChange: (v: boolean) => void;
	isDarkMode: boolean;
}) {
	return (
		<button
			type="button"
			onClick={() => onChange(!checked)}
			className={cn(
				"flex h-4 w-4 flex-shrink-0 items-center justify-center rounded transition-all duration-150",
				checked
					? isDarkMode
						? "bg-white"
						: "bg-primary-base"
					: cn(
							"border bg-transparent hover:border-white/50",
							isDarkMode ? "border-white/25" : "border-black/15",
						),
			)}
		>
			{checked && (
				<svg
					className={cn(
						"h-2.5 w-2.5",
						isDarkMode ? "text-black" : "text-white",
					)}
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
	const [isDarkMode, setIsDarkMode] = useState(true);

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
		<div className={cn("w-full space-y-4", isDarkMode ? "dark" : "light")}>
			<div
				className={cn(
					"relative overflow-hidden rounded-2xl p-6 transition-all duration-300 lg:p-8",
					"bg-white text-text-strong-950 shadow-lg ring-1 ring-black/5",
					"dark:bg-[#111113] dark:text-white dark:shadow-xl dark:ring-1 dark:ring-white/5",
				)}
			>
				{/* Theme toggle pill */}
				<button
					type="button"
					onClick={() => setIsDarkMode(!isDarkMode)}
					className={cn(
						"absolute top-4 right-4 flex items-center gap-2 rounded-full border p-1 transition-all duration-200",
						"border-black/5 bg-black/5 text-text-soft-400 hover:bg-black/10",
						"dark:border-white/10 dark:bg-white/5 dark:text-white/50 dark:hover:bg-white/10",
					)}
				>
					<Icon name={isDarkMode ? "moon" : "sun"} className="h-3.5 w-3.5" />
				</button>

				{/* Check icon / Logo */}
				<div className="mt-4 mb-6 flex justify-center">
					<div
						className={cn(
							"flex h-10 w-10 items-center justify-center rounded-full border",
							"border-black/10 dark:border-white/15",
						)}
					>
						<Logo theme={isDarkMode ? "dark" : "light"} />
					</div>
				</div>

				{/* Heading */}
				<div className="mb-6 text-center">
					<h2
						className={cn(
							"font-bold text-xl leading-tight",
							"text-text-strong-950 dark:text-white",
						)}
					>
						Do you want to
						<br />
						unsubscribe?
					</h2>
					<p
						className={cn(
							"mt-2 text-sm",
							"text-text-sub-600 dark:text-white/50",
						)}
					>
						Confirm preferences for{" "}
						<span className="text-text-strong-950 dark:text-white/80">
							{contactEmail}
						</span>
						<br />
						at{" "}
						<span className="text-text-strong-950 dark:text-white/80">
							{orgName}
						</span>
						:
					</p>
				</div>

				{/* Channels list */}
				<div className="mb-6 space-y-1">
					{previewChannels.map((t) => {
						const isCurrent = t.id === channel.id;
						const isPrivate = t.visibility === "private";

						return (
							<div
								key={t.id}
								className={cn(
									"rounded-2xl border transition-all duration-200",
									isCurrent
										? "border-primary-base"
										: "border-transparent hover:bg-bg-weak-50 dark:hover:bg-white/5",
								)}
							>
								<button
									type="button"
									onClick={() =>
										setChecked((prev) => ({ ...prev, [t.id]: !prev[t.id] }))
									}
									className="flex w-full gap-2 px-4 pt-3.5 pb-2 text-left"
								>
									<Checkbox
										checked={checked[t.id] ?? false}
										onChange={(val) =>
											setChecked((prev) => ({ ...prev, [t.id]: val }))
										}
										isDarkMode={isDarkMode}
									/>
									<div className="-mt-px min-w-0 flex-1">
										<div className="flex items-center justify-between gap-2">
											<div className="flex flex-1 items-center justify-between gap-2">
												{t.name ? (
													<p
														className={cn(
															"font-medium text-sm leading-4",
															"text-text-strong-950 dark:text-white",
														)}
													>
														{t.name}
													</p>
												) : (
													<Skeleton
														className={cn(
															"h-3.5 w-32 rounded-md",
															"bg-black/5 dark:bg-white/10",
														)}
													/>
												)}
												{isCurrent && (
													<span className="rounded-full bg-primary-base px-2 py-0.5 font-semibold text-[10px] text-white">
														New
													</span>
												)}
											</div>
										</div>
										{t.description ? (
											<p
												className={cn(
													"mt-1 truncate text-[11px]",
													"text-text-soft-400 dark:text-white/40",
												)}
											>
												{t.description}
											</p>
										) : (
											isCurrent && (
												<Skeleton
													className={cn(
														"mt-1 mb-3 h-3 w-48 rounded-md",
														"bg-black/5 dark:bg-white/5",
													)}
												/>
											)
										)}
									</div>
								</button>
								<AnimatePresence initial={false}>
									{isCurrent && isPrivate && (
										<motion.div
											initial={{ height: 0, opacity: 0 }}
											animate={{ height: "auto", opacity: 1 }}
											exit={{ height: 0, opacity: 0 }}
											transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
											className="overflow-hidden"
										>
											<div className="flex gap-2 rounded-b-[15px] bg-primary-base px-4 py-2">
												<Icon
													name="lock"
													className="h-3.5 w-3.5 text-white/90"
												/>
												<p className="font-medium text-[11px] text-white leading-tight">
													Currently <strong>Private</strong>. Hidden from
													subscribers until set to Public.
												</p>
											</div>
										</motion.div>
									)}
								</AnimatePresence>
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
							: cn(
									"bg-primary-base text-white hover:bg-primary-base/90 active:scale-[0.98]",
									"dark:bg-white dark:text-black dark:hover:bg-white/90",
								),
					)}
				>
					{saved ? "✓ Updated!" : "Update"}
				</button>

				{/* Or divider */}
				<div className="my-4 flex items-center gap-3">
					<div className="h-px flex-1 bg-black/10 dark:bg-white/10" />
					<span className="text-[11px] text-text-soft-400 dark:text-white/30">
						Or
					</span>
					<div className="h-px flex-1 bg-black/10 dark:bg-white/10" />
				</div>

				{/* Unsubscribe All button */}
				<button
					type="button"
					onClick={handleUnsubscribeAll}
					className={cn(
						"w-full rounded-xl border py-3 font-semibold text-sm transition-all active:scale-[0.98]",
						"border-black/10 text-text-strong-950 hover:bg-black/5",
						"dark:border-white/15 dark:text-white dark:hover:bg-white/5",
					)}
				>
					Unsubscribe All
				</button>

				{/* Footer */}
				<div className="mt-6 flex items-center justify-center gap-1.5">
					<span className="text-[11px] text-text-soft-400 dark:text-white/25">
						Powered by
					</span>
					<div
						className={cn(
							"flex h-4 w-4 items-center justify-center rounded",
							"bg-black/5 dark:bg-white/10",
						)}
					>
						<Logo theme={isDarkMode ? "dark" : "light"} />
					</div>
					<span
						className={cn(
							"font-medium text-[11px]",
							"text-text-soft-400 dark:text-white/40",
						)}
					>
						Reloop
					</span>
				</div>
			</div>
		</div>
	);
}
