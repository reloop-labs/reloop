import * as Avatar from "@reloop/ui/avatar";
import { Icon } from "@reloop/ui/icon";
import * as Label from "@reloop/ui/label";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import type { Group } from "#/features/contacts/hooks/use-contacts-query";

interface GroupSelectProps {
	selectedGroupIds: string[];
	onChange: (groupIds: string[]) => void;
	disabled?: boolean;
	open?: boolean;
}

export const GroupSelect = ({
	selectedGroupIds,
	onChange,
	disabled = false,
	open = true,
}: GroupSelectProps) => {
	const [groupInput, setGroupInput] = useState("");
	const [showGroupDropdown, setShowGroupDropdown] = useState(false);
	const [hoveredGroupId, setHoveredGroupId] = useState<string | null>(null);
	const groupInputRef = useRef<HTMLInputElement>(null);

	// Fetch all groups for the organization
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

	const addGroup = (groupId: string) => {
		if (!selectedGroupIds.includes(groupId)) {
			onChange([...selectedGroupIds, groupId]);
		}
		setGroupInput("");
		setShowGroupDropdown(false);
	};

	const removeGroup = (groupId: string) => {
		onChange(selectedGroupIds.filter((id) => id !== groupId));
	};

	const getGroupName = (groupId: string) => {
		return allGroups.find((g) => g.id === groupId)?.name || "";
	};

	const availableGroups = allGroups.filter(
		(group) => !selectedGroupIds.includes(group.id),
	);

	const filteredGroups = groupInput
		? availableGroups.filter((g) =>
				g.name.toLowerCase().includes(groupInput.toLowerCase()),
			)
		: availableGroups;

	return (
		<div className="flex flex-col gap-1 border-stroke-soft-100 pt-2">
			<Label.Root className="mb-1.5 block font-medium text-text-strong-950 text-xs">
				Assign to Groups (Optional)
			</Label.Root>
			<div className="relative">
				<label className="group/chips flex min-h-[44px] cursor-text flex-wrap content-start rounded-xl border border-stroke-soft-200 bg-bg-white-0 px-3 py-2.5 transition duration-200 ease-out focus-within:border-stroke-strong-950 focus-within:shadow-button-important-focus hover:[&:not(:focus-within)]:bg-bg-weak-50">
					{selectedGroupIds.map((groupId) => {
						const groupName = getGroupName(groupId);
						if (!groupName) return null;
						return (
							<span
								key={groupId}
								className="inline-flex items-center gap-1.5 rounded-full border border-stroke-soft-200 bg-bg-weak-50 py-0.5 pr-2 pl-0.5 text-paragraph-xs text-text-strong-950 transition-all"
							>
								<Avatar.Root size="20" color="gray">
									<Icon name="modules" className="h-3 w-3 text-text-sub-600" />
								</Avatar.Root>
								<span className="font-medium">{groupName}</span>
								<button
									type="button"
									onClick={(e) => {
										e.preventDefault();
										e.stopPropagation();
										removeGroup(groupId);
									}}
									className="ml-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full text-text-sub-600 transition-colors hover:bg-stroke-soft-200 hover:text-text-strong-950"
									disabled={disabled}
								>
									<Icon name="cross" className="h-3 w-3" />
								</button>
							</span>
						);
					})}
					<input
						ref={groupInputRef}
						type="text"
						value={groupInput}
						onChange={(e) => {
							setGroupInput(e.target.value);
							setShowGroupDropdown(true);
						}}
						onFocus={() => setShowGroupDropdown(true)}
						onBlur={(e) => {
							const relatedTarget = e.relatedTarget as HTMLElement;
							if (!relatedTarget?.closest(".absolute")) {
								setShowGroupDropdown(false);
							}
						}}
						placeholder={
							selectedGroupIds.length === 0 ? "Search Groups..." : ""
						}
						className="min-w-[80px] flex-1 bg-transparent text-paragraph-sm text-text-sub-600 outline-none placeholder:text-text-soft-400"
						disabled={disabled}
					/>
				</label>
				{/* Animated Dropdown Menu */}
				<AnimatePresence>
					{showGroupDropdown && filteredGroups.length > 0 && (
						<motion.div
							initial={{ opacity: 0, y: -6, scale: 0.96 }}
							animate={{ opacity: 1, y: 0, scale: 1 }}
							exit={{ opacity: 0, y: -6, scale: 0.96 }}
							transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
							onMouseLeave={() => setHoveredGroupId(null)}
							className="absolute right-0 left-0 z-50 mt-1.5 max-h-56 overflow-y-auto rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-1.5 shadow-regular-md ring-1 ring-stroke-soft-100 ring-inset dark:ring-stroke-soft-100/50"
						>
							{filteredGroups.map((group) => (
								<button
									key={group.id}
									type="button"
									onMouseEnter={() => setHoveredGroupId(group.id)}
									onMouseDown={(e) => e.preventDefault()}
									onClick={() => addGroup(group.id)}
									className="group relative flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-paragraph-sm text-text-strong-950 transition-colors"
								>
									{hoveredGroupId === group.id && (
										<motion.span
											layoutId="group-dropdown-hover-pill"
											className="absolute inset-0 rounded-xl bg-bg-weak-50"
											transition={{
												type: "spring",
												stiffness: 500,
												damping: 38,
											}}
										/>
									)}
									<span className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full border border-stroke-soft-100 bg-bg-weak-50 text-text-sub-600 transition-colors group-hover:bg-bg-white-0 group-hover:text-text-strong-950">
										<Icon name="modules" className="h-3.5 w-3.5" />
									</span>
									<span className="relative z-10 font-medium text-text-strong-950 text-xs">
										{group.name}
									</span>
								</button>
							))}
						</motion.div>
					)}
					{showGroupDropdown && filteredGroups.length === 0 && groupInput && (
						<motion.div
							initial={{ opacity: 0, y: -6, scale: 0.96 }}
							animate={{ opacity: 1, y: 0, scale: 1 }}
							exit={{ opacity: 0, y: -6, scale: 0.96 }}
							transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
							className="absolute right-0 left-0 z-50 mt-1.5 rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-4 text-center shadow-regular-md ring-1 ring-stroke-soft-100 ring-inset dark:ring-stroke-soft-100/50"
						>
							<p className="text-paragraph-xs text-text-soft-400">
								No groups found for &ldquo;{groupInput}&rdquo;
							</p>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
			<p className="text-paragraph-xs text-text-soft-400">
				You can create new groups from the Groups tab.
			</p>
		</div>
	);
};
