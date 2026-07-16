
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { Logo } from "@reloop/ui/logo";
import { useEffect, useMemo, useState } from "react";

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
	isDarkMode,
}: {
	checked: boolean;
	isDarkMode: boolean;
}) {
	return (
		<div
			className={cn(
				"flex h-4 w-4 flex-shrink-0 items-center justify-center rounded transition-all duration-150",
				checked
					? isDarkMode
						? "bg-white"
						: "bg-primary-base"
					: cn(
							"border bg-transparent",
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
		</div>
	);
}

export function SubscriberPreview({
	channels,
	orgName = "Your Organization",
}: SubscriberPreviewProps) {
	const [isDarkMode, setIsDarkMode] = useState(true);

	// Only show public channels in the preview
	const publicChannels = useMemo(() => {
		return channels.filter((t) => t.visibility === "public");
	}, [channels]);

	const publicChannelsKey = JSON.stringify(
		publicChannels.map((t) => ({
			id: t.id,
			defaultSubscription: t.defaultSubscription,
		})),
	);

	const [checked, setChecked] = useState<Record<string, boolean>>({});
	const [saved, setSaved] = useState(false);

	// Reset when channels change
	// biome-ignore lint/correctness/useExhaustiveDependencies: only run when serialized key changes
	useEffect(() => {
		const initialStates = Object.fromEntries(
			publicChannels.map((t) => [t.id, t.defaultSubscription === "opt_in"]),
		);
		setChecked(initialStates);
		setSaved(false);
	}, [publicChannelsKey]);

	const handleUpdate = () => {
		setSaved(true);
		setTimeout(() => setSaved(false), 2000);
	};

	const handleUnsubscribeAll = () => {
		setChecked(Object.fromEntries(publicChannels.map((t) => [t.id, false])));
	};

	return (
		<div className={cn("w-full space-y-4", isDarkMode ? "dark" : "light")}>
			<div
				className={cn(
					"relative overflow-hidden rounded-2xl px-4 pt-6 pb-4 transition-all duration-300",
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
						<Logo className="h-5 w-5" />
					</div>
				</div>

				{/* Heading */}
				<div className="mb-6 text-center">
					<h2
						className={cn(
							"font-bold text-xl leading-tight",
							"px-4 text-text-strong-950 dark:text-white",
						)}
					>
						Do you want to unsubscribe?
					</h2>
					<p
						className={cn(
							"mt-2 text-sm",
							"text-text-sub-600 dark:text-white/50",
						)}
					>
						Confirm preferences for at{" "}
						<span className="text-text-strong-950 dark:text-white/80">
							{orgName}
						</span>
						:
					</p>
				</div>

				{/* Channels list */}
				{publicChannels.length === 0 ? (
					<div
						className={cn(
							"mb-6 flex flex-col items-center gap-2 rounded-xl border border-dashed py-8 text-center",
							"border-black/10 dark:border-white/10",
						)}
					>
						<p className="text-[11px] text-text-soft-400 dark:text-white/30">
							No public channels yet. Set a channel to Public to show it here.
						</p>
					</div>
				) : (
					<div className="mb-6 space-y-1">
						{publicChannels.map((channel) => (
							<button
								key={channel.id}
								type="button"
								onClick={() =>
									setChecked((prev) => ({
										...prev,
										[channel.id]: !prev[channel.id],
									}))
								}
								className={cn(
									"flex w-full gap-2 rounded-2xl px-4 pt-3.5 pb-2 text-left transition-colors",
									"hover:bg-bg-weak-50 dark:hover:bg-white/5",
								)}
							>
								<Checkbox
									checked={checked[channel.id] ?? false}
									isDarkMode={isDarkMode}
								/>
								<div className="-mt-px min-w-0 flex-1">
									<p
										className={cn(
											"truncate font-medium text-sm leading-4",
											"text-text-strong-950 dark:text-white",
										)}
									>
										{channel.name}
									</p>
									{channel.description && (
										<p
											className={cn(
												"mt-1 truncate text-[11px]",
												"text-text-soft-400 dark:text-white/40",
											)}
										>
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
						<Logo className="h-3 w-3" />
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
