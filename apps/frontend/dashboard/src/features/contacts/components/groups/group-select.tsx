import * as Avatar from "@reloop/ui/avatar";
import { cn } from "@reloop/ui/cn";
import { Icon, type IconName } from "@reloop/ui/icon";
import * as Label from "@reloop/ui/label";
import { useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useId, useMemo, useRef, useState } from "react";
import type { Group } from "#/features/contacts/hooks/use-contacts-query";
import { AnimatedHoverBackground } from "#/features/onboarding/animated-hover-background";

interface GroupSelectProps {
	selectedGroupIds: string[];
	onChange: (groupIds: string[]) => void;
	disabled?: boolean;
	open?: boolean;
	/** Field label. Defaults to create-flow copy. */
	label?: string;
	/** Icon shown before the label text. */
	labelIcon?: IconName;
	/** Hide the per-item avatar/icon in chips and dropdown rows. */
	hideItemIcons?: boolean;
	/** Small parenthetical hint next to the label, e.g. "for targeting". */
	labelHint?: string;
	/** Helper text under the field. Pass empty string to hide. */
	description?: string;
	className?: string;
	/** Known groups (e.g. contact.groups) so chips resolve before the list loads. */
	knownGroups?: { id: string; name: string }[];
	id?: string;
}

export const GroupSelect = ({
	selectedGroupIds,
	onChange,
	disabled = false,
	open = true,
	label = "Assign to Groups (Optional)",
	labelIcon,
	hideItemIcons = false,
	labelHint,
	description = "You can create new groups from the Groups tab.",
	className,
	knownGroups,
	id,
}: GroupSelectProps) => {
	const [groupInput, setGroupInput] = useState("");
	const [showGroupDropdown, setShowGroupDropdown] = useState(false);
	const [hoverIdx, setHoverIdx] = useState<number | undefined>(undefined);
	const groupInputRef = useRef<HTMLInputElement>(null);
	const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
	const scrollContainerRef = useRef<HTMLDivElement>(null);
	// Explicit input id so the wrapping box label activates the search input —
	// never a chip's remove button.
	const inputId = id ?? useId();

	const { data: allGroupsData } = useQuery({
		queryKey: ["contacts", "groups", "select"],
		queryFn: async () => {
			const res = await fetch("/api/contacts/v1/groups/list?limit=100", {
				credentials: "include",
			});
			if (!res.ok) throw new Error("Failed");
			return res.json() as Promise<{ groups: Group[]; total: number }>;
		},
		enabled: open,
	});

	const allGroups = allGroupsData?.groups || [];

	const nameById = useMemo(() => {
		const map = new Map<string, string>();
		for (const g of knownGroups ?? []) {
			map.set(g.id, g.name);
		}
		for (const g of allGroups) {
			map.set(g.id, g.name);
		}
		return map;
	}, [allGroups, knownGroups]);

	const addGroup = (groupId: string) => {
		if (!selectedGroupIds.includes(groupId)) {
			onChange([...selectedGroupIds, groupId]);
		}
		setGroupInput("");
		setHoverIdx(undefined);
		// Keep the dropdown open for multi-select; return focus to search
		// (keyboard activation may have focused the row being removed).
		groupInputRef.current?.focus();
	};

	const removeGroup = (groupId: string) => {
		onChange(selectedGroupIds.filter((gid) => gid !== groupId));
		// The chip's remove button unmounts — keep focus in the search input
		// instead of losing it (Tab would otherwise land on the modal close).
		groupInputRef.current?.focus();
	};

	const getGroupName = (groupId: string) => nameById.get(groupId) || "";

	const availableGroups = allGroups.filter(
		(group) => !selectedGroupIds.includes(group.id),
	);

	const filteredGroups = groupInput
		? availableGroups.filter((g) =>
				g.name.toLowerCase().includes(groupInput.toLowerCase()),
			)
		: availableGroups;

	const currentTab = buttonRefs.current[hoverIdx ?? -1];
	const currentRect = currentTab?.getBoundingClientRect();

	return (
		<div className={cn("flex flex-col gap-1.5", className)}>
			<div className="flex flex-wrap items-center gap-1.5">
				<Label.Root
					htmlFor={inputId}
					className="font-medium text-text-strong-950 text-xs"
				>
					<span className="inline-flex items-center gap-1.5">
						{labelIcon ? (
							<Icon name={labelIcon} className="size-3.5 text-text-sub-600" />
						) : null}
						{label}
					</span>
				</Label.Root>
				{labelHint ? (
					<span className="font-normal text-[11px] text-text-soft-400">
						({labelHint})
					</span>
				) : null}
			</div>
			<div className="relative">
				<label
					htmlFor={inputId}
					className={cn(
						"group/chips flex min-h-[42px] cursor-text flex-wrap content-start gap-1.5 rounded-xl border border-stroke-soft-100 bg-bg-white-0 px-3 py-2 transition duration-200 ease-out focus-within:border-stroke-strong-950 focus-within:shadow-button-important-focus dark:border-stroke-soft-100/40 hover:[&:not(:focus-within)]:bg-bg-weak-50/50",
						disabled && "pointer-events-none opacity-50",
					)}
				>
					{selectedGroupIds.map((groupId) => {
						const groupName = getGroupName(groupId);
						if (!groupName) return null;
						return (
							<span
								key={groupId}
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
								className={cn(
									"inline-flex h-6 max-w-full shrink-0 cursor-default items-center gap-1.5 rounded-full border border-stroke-soft-100 bg-bg-weak-50 py-0.5 pr-2 text-paragraph-xs text-text-strong-950 transition-all dark:border-stroke-soft-100/40",
									hideItemIcons ? "pl-2.5" : "pl-px",
								)}
							>
								{hideItemIcons ? null : (
									<Avatar.Root size="20" color="gray">
										<Icon
											name="modules"
											className="h-3 w-3 text-text-sub-600"
										/>
									</Avatar.Root>
								)}
								<span className="truncate font-medium">{groupName}</span>
								<button
									type="button"
									onClick={(e) => {
										e.preventDefault();
										e.stopPropagation();
										removeGroup(groupId);
									}}
									className="ml-0.5 flex h-3.5 w-3.5 shrink-0 cursor-pointer items-center justify-center rounded-full text-text-sub-600 transition-colors hover:bg-stroke-soft-200 hover:text-text-strong-950"
									disabled={disabled}
									aria-label={`Remove ${groupName}`}
								>
									<X className="h-3 w-3" strokeWidth={2.5} />
								</button>
							</span>
						);
					})}
					<input
						ref={groupInputRef}
						id={inputId}
						type="text"
						value={groupInput}
						onChange={(e) => {
							setGroupInput(e.target.value);
							setShowGroupDropdown(true);
						}}
						onKeyDown={(e) => {
							if (
								e.key === "Backspace" &&
								!groupInput &&
								selectedGroupIds.length > 0
							) {
								const lastId = selectedGroupIds[selectedGroupIds.length - 1];
								if (lastId) {
									onChange(selectedGroupIds.filter((gid) => gid !== lastId));
								}
							}
						}}
						onFocus={() => setShowGroupDropdown(true)}
						onBlur={(e) => {
							const relatedTarget = e.relatedTarget as HTMLElement | null;
							if (!relatedTarget?.closest("[data-group-select-dropdown]")) {
								setShowGroupDropdown(false);
							}
						}}
						placeholder={
							selectedGroupIds.length === 0 ? "Search groups..." : ""
						}
						className="min-w-[80px] flex-1 bg-transparent text-paragraph-sm text-text-sub-600 outline-none placeholder:text-text-soft-400"
						disabled={disabled}
					/>
				</label>
				<AnimatePresence>
					{showGroupDropdown && filteredGroups.length > 0 && (
						<motion.div
							data-group-select-dropdown
							initial={{ opacity: 0, y: -6, scale: 0.96 }}
							animate={{ opacity: 1, y: 0, scale: 1 }}
							exit={{ opacity: 0, y: -6, scale: 0.96 }}
							transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
							className="absolute right-0 left-0 z-50 mt-1.5 max-h-56 overflow-y-auto rounded-2xl bg-bg-white-0 p-2 shadow-regular-md ring-1 ring-stroke-soft-100 ring-inset dark:ring-stroke-soft-100/50"
						>
							<div ref={scrollContainerRef} className="relative">
								{filteredGroups.map((group, idx) => (
									<button
										key={group.id}
										type="button"
										ref={(el) => {
											if (el) {
												buttonRefs.current[idx] = el;
											}
										}}
										onPointerEnter={() => setHoverIdx(idx)}
										onPointerLeave={() => setHoverIdx(undefined)}
										onMouseDown={(e) => e.preventDefault()}
										onClick={() => addGroup(group.id)}
										className={cn(
											"flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors",
											!currentRect && hoverIdx === idx && "bg-neutral-alpha-10",
										)}
									>
										{hideItemIcons ? null : (
											<span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-stroke-soft-100 bg-bg-weak-50 text-text-sub-600">
												<Icon name="modules" className="h-3.5 w-3.5" />
											</span>
										)}
										<span className="min-w-0 flex-1 truncate font-medium text-sm text-text-strong-950 dark:text-white">
											{group.name}
										</span>
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
					{showGroupDropdown && filteredGroups.length === 0 && groupInput && (
						<motion.div
							data-group-select-dropdown
							initial={{ opacity: 0, y: -6, scale: 0.96 }}
							animate={{ opacity: 1, y: 0, scale: 1 }}
							exit={{ opacity: 0, y: -6, scale: 0.96 }}
							transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
							className="absolute right-0 left-0 z-50 mt-1.5 rounded-2xl bg-bg-white-0 p-2 shadow-regular-md ring-1 ring-stroke-soft-100 ring-inset dark:ring-stroke-soft-100/50"
						>
							<p className="px-3 py-4 text-center text-paragraph-xs text-text-soft-400">
								No groups found for &ldquo;{groupInput}&rdquo;
							</p>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
			{description ? (
				<p className="text-paragraph-xs text-text-soft-400">{description}</p>
			) : null}
		</div>
	);
};
