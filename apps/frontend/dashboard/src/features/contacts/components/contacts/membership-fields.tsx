import * as Avatar from "@reloop/ui/avatar";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as Label from "@reloop/ui/label";
import { useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { GroupSelect } from "#/features/contacts/components/groups/group-select";
import { AnimatedHoverBackground } from "#/features/onboarding/animated-hover-background";

interface MembershipGroup {
	id: string;
	name: string;
}

interface MembershipChannel {
	id: string;
	name: string;
	defaultSubscription?: "opt_in" | "opt_out";
}

interface GroupsFieldProps {
	contactId: string;
	knownGroups?: MembershipGroup[];
	selectedGroupIds: string[];
	onChange: (ids: string[]) => void;
	disabled?: boolean;
}

export function GroupsField({
	contactId,
	knownGroups,
	selectedGroupIds,
	onChange,
	disabled,
}: GroupsFieldProps) {
	return (
		<GroupSelect
			id={`groups-${contactId}`}
			selectedGroupIds={selectedGroupIds}
			onChange={onChange}
			disabled={disabled}
			label="Groups"
			labelIcon="modules"
			description=""
			knownGroups={knownGroups}
		/>
	);
}

interface ChannelsFieldProps {
	contactId: string;
	knownChannels?: { id: string; name: string }[];
	selectedChannelIds: string[];
	onChange: (ids: string[]) => void;
	disabled?: boolean;
	isSubscribed?: boolean;
}

export function ChannelsField({
	contactId,
	knownChannels,
	selectedChannelIds,
	onChange,
	disabled,
	isSubscribed = true,
}: ChannelsFieldProps) {
	const [channelInput, setChannelInput] = useState("");
	const [showChannelDropdown, setShowChannelDropdown] = useState(false);
	const [hoverIdx, setHoverIdx] = useState<number | undefined>(undefined);
	const channelInputRef = useRef<HTMLInputElement>(null);
	const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
	const scrollContainerRef = useRef<HTMLDivElement>(null);

	const { data: allChannelsData } = useQuery({
		queryKey: ["contacts", "channels", "edit-form"],
		queryFn: async () => {
			const res = await fetch("/api/contacts/v1/channels/list?limit=100", {
				credentials: "include",
			});
			if (!res.ok) throw new Error("Failed");
			return res.json() as Promise<{
				channels: MembershipChannel[];
				total: number;
			}>;
		},
	});

	const allChannels = allChannelsData?.channels || [];

	const channelNameById = useMemo(() => {
		const map = new Map<string, string>();
		for (const c of knownChannels ?? []) {
			map.set(c.id, c.name);
		}
		for (const c of allChannels) {
			map.set(c.id, c.name);
		}
		return map;
	}, [allChannels, knownChannels]);

	// Reset search when switching to a different contact
	// biome-ignore lint/correctness/useExhaustiveDependencies: contactId prop change must reset search
	useEffect(() => {
		setChannelInput("");
		setShowChannelDropdown(false);
	}, [contactId]);

	const addChannel = (channelId: string) => {
		if (!selectedChannelIds.includes(channelId)) {
			onChange([...selectedChannelIds, channelId]);
		}
		setChannelInput("");
		setHoverIdx(undefined);
		// Keep the dropdown open for multi-select; return focus to search
		// (keyboard activation may have focused the row being removed).
		channelInputRef.current?.focus();
	};

	const removeChannel = (channelId: string) => {
		onChange(selectedChannelIds.filter((id) => id !== channelId));
		// The chip's remove button unmounts — keep focus in the search input
		// instead of losing it (Tab would otherwise land on the modal close).
		channelInputRef.current?.focus();
	};

	const getChannelName = (channelId: string) =>
		channelNameById.get(channelId) || "";

	const availableChannels = allChannels.filter(
		(channel) => !selectedChannelIds.includes(channel.id),
	);

	const filteredChannels = channelInput
		? availableChannels.filter((t) =>
				t.name.toLowerCase().includes(channelInput.toLowerCase()),
			)
		: availableChannels;

	const currentTab = buttonRefs.current[hoverIdx ?? -1];
	const currentRect = currentTab?.getBoundingClientRect();

	return (
		<div
			className={cn(
				"flex flex-col gap-1.5 transition-opacity",
				!isSubscribed && "opacity-60",
			)}
		>
			<Label.Root
				htmlFor={`channels-${contactId}`}
				className="font-medium text-text-strong-950 text-xs"
			>
				<span className="inline-flex items-center gap-1.5">
					<Icon
						name="notification-indicator"
						className="size-3.5 text-text-sub-600"
					/>
					Channels
				</span>
			</Label.Root>
			<div className="relative">
				<label
					htmlFor={`channels-${contactId}`}
					className={cn(
						"group/chips flex min-h-[42px] cursor-text flex-wrap content-start gap-1.5 rounded-xl border border-stroke-soft-100 bg-bg-white-0 px-3 py-2 transition duration-200 ease-out focus-within:border-stroke-strong-950 focus-within:shadow-button-important-focus dark:border-stroke-soft-100/40 hover:[&:not(:focus-within)]:bg-bg-weak-50/50",
						disabled && "pointer-events-none opacity-50",
					)}
				>
					{selectedChannelIds.map((channelId) => {
						const channelName = getChannelName(channelId) || "Channel";
						return (
							<span
								key={channelId}
								onMouseDown={(e) => {
									// Only the X removes — clicking the badge body does nothing
									// (blocks the wrapping label from focusing the input).
									if ((e.target as HTMLElement).closest("button") === null) {
										e.preventDefault();
									}
								}}
								onClick={(e) => {
									// The X stops propagation itself; anything else reaching
									// here is a badge-body click — swallow it so the label
									// doesn't activate any control.
									e.stopPropagation();
								}}
								className="inline-flex h-6 max-w-full shrink-0 cursor-default items-center gap-1.5 rounded-full border border-stroke-soft-100 bg-bg-weak-50 py-0.5 pr-2 pl-px text-paragraph-xs text-text-strong-950 transition-all dark:border-stroke-soft-100/40"
							>
								<Avatar.Root size="20" color="gray">
									<Icon
										name="notification-indicator"
										className="h-3 w-3 text-text-sub-600"
									/>
								</Avatar.Root>
								<span className="truncate font-medium">{channelName}</span>
								<button
									type="button"
									onClick={(e) => {
										e.preventDefault();
										e.stopPropagation();
										removeChannel(channelId);
									}}
									className="ml-0.5 flex h-3.5 w-3.5 shrink-0 cursor-pointer items-center justify-center rounded-full text-text-sub-600 transition-colors hover:bg-stroke-soft-200 hover:text-text-strong-950"
									disabled={disabled}
									aria-label={`Remove ${channelName}`}
								>
									<X className="h-3 w-3" strokeWidth={2.5} />
								</button>
							</span>
						);
					})}
					<input
						ref={channelInputRef}
						id={`channels-${contactId}`}
						type="text"
						value={channelInput}
						onChange={(e) => {
							setChannelInput(e.target.value);
							setShowChannelDropdown(true);
						}}
						onKeyDown={(e) => {
							if (
								e.key === "Backspace" &&
								!channelInput &&
								selectedChannelIds.length > 0
							) {
								const lastId =
									selectedChannelIds[selectedChannelIds.length - 1];
								if (lastId) {
									onChange(selectedChannelIds.filter((id) => id !== lastId));
								}
							}
						}}
						onFocus={() => setShowChannelDropdown(true)}
						onBlur={(e) => {
							const relatedTarget = e.relatedTarget as HTMLElement | null;
							if (!relatedTarget?.closest("[data-channel-select-dropdown]")) {
								setShowChannelDropdown(false);
							}
						}}
						placeholder={
							selectedChannelIds.length === 0
								? "Search channels to enroll..."
								: "Add another..."
						}
						className="min-w-[100px] flex-1 bg-transparent text-paragraph-sm text-text-sub-600 outline-none placeholder:text-text-soft-400"
						disabled={disabled}
					/>
				</label>
				<AnimatePresence>
					{showChannelDropdown && filteredChannels.length > 0 && (
						<motion.div
							data-channel-select-dropdown
							initial={{ opacity: 0, y: -6, scale: 0.96 }}
							animate={{ opacity: 1, y: 0, scale: 1 }}
							exit={{ opacity: 0, y: -6, scale: 0.96 }}
							transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
							className="absolute right-0 left-0 z-50 mt-1.5 max-h-56 overflow-y-auto rounded-2xl bg-bg-white-0 p-2 shadow-regular-md ring-1 ring-stroke-soft-100 ring-inset dark:ring-stroke-soft-100/50"
						>
							<div ref={scrollContainerRef} className="relative">
								{filteredChannels.map((channel, idx) => (
									<button
										key={channel.id}
										type="button"
										ref={(el) => {
											if (el) {
												buttonRefs.current[idx] = el;
											}
										}}
										onPointerEnter={() => setHoverIdx(idx)}
										onPointerLeave={() => setHoverIdx(undefined)}
										onMouseDown={(e) => e.preventDefault()}
										onClick={() => addChannel(channel.id)}
										className={cn(
											"flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors",
											!currentRect && hoverIdx === idx && "bg-neutral-alpha-10",
										)}
									>
										<span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-stroke-soft-100 bg-bg-weak-50 text-text-sub-600">
											<Icon
												name="notification-indicator"
												className="h-3.5 w-3.5"
											/>
										</span>
										<span className="min-w-0 flex-1 truncate font-medium text-sm text-text-strong-950 dark:text-white">
											{channel.name}
										</span>
										{channel.defaultSubscription === "opt_out" && (
											<span className="shrink-0 text-paragraph-xs text-text-soft-400">
												Opt-out default
											</span>
										)}
									</button>
								))}
								<AnimatedHoverBackground
									rect={currentRect}
									tabElement={currentTab ?? undefined}
									containerElement={scrollContainerRef.current}
									className="rounded-lg"
								/>
							</div>
						</motion.div>
					)}
					{showChannelDropdown &&
						filteredChannels.length === 0 &&
						channelInput && (
							<motion.div
								data-channel-select-dropdown
								initial={{ opacity: 0, y: -6, scale: 0.96 }}
								animate={{ opacity: 1, y: 0, scale: 1 }}
								exit={{ opacity: 0, y: -6, scale: 0.96 }}
								transition={{
									duration: 0.18,
									ease: [0.16, 1, 0.3, 1],
								}}
								className="absolute right-0 left-0 z-50 mt-1.5 rounded-2xl bg-bg-white-0 p-2 shadow-regular-md ring-1 ring-stroke-soft-100 ring-inset dark:ring-stroke-soft-100/50"
							>
								<p className="px-3 py-4 text-center text-paragraph-xs text-text-soft-400">
									No channels found for &ldquo;{channelInput}&rdquo;
								</p>
							</motion.div>
						)}
				</AnimatePresence>
			</div>
		</div>
	);
}
