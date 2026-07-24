import { Icon } from "@reloop/ui/icon";
import * as Label from "@reloop/ui/label";
import { useQuery } from "@tanstack/react-query";
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
			<Label.Root className="font-medium text-text-strong-950 text-xs">
				Assign Groups to the Imported Contacts (Optional)
			</Label.Root>{" "}
			<div className="relative">
				<label className="group/chips flex min-h-[44px] cursor-text flex-wrap content-start gap-1.5 rounded-xl border border-stroke-soft-200 bg-bg-white-0 px-3 py-2.5 shadow-regular-xs transition duration-200 ease-out focus-within:border-stroke-strong-950 focus-within:shadow-button-important-focus hover:[&:not(:focus-within)]:bg-bg-weak-50">
					{selectedGroupIds.map((groupId) => {
						const groupName = getGroupName(groupId);
						if (!groupName) return null;
						return (
							<span
								key={groupId}
								className="inline-flex items-center gap-1 rounded-md border border-stroke-soft-200 bg-bg-weak-50 px-2 py-0.5 text-paragraph-xs text-text-strong-950"
							>
								<Icon name="modules" className="h-3 w-3 text-text-sub-600" />
								{groupName}
								<button
									type="button"
									onClick={(e) => {
										e.preventDefault();
										e.stopPropagation();
										removeGroup(groupId);
									}}
									className="ml-0.5 text-text-sub-600 transition-colors hover:text-text-strong-950"
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
				{/* Dropdown */}
				{showGroupDropdown && filteredGroups.length > 0 && (
					<div className="absolute z-10 mx-auto mt-1 max-h-48 w-[calc(100%-4px)] overflow-y-auto rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-1 shadow-lg">
						{filteredGroups.map((group) => (
							<button
								key={group.id}
								type="button"
								onClick={() => addGroup(group.id)}
								className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-paragraph-sm text-text-strong-950 transition-colors hover:bg-bg-weak-50"
							>
								<Icon name="modules" className="h-3 w-3 text-text-sub-600" />
								{group.name}
							</button>
						))}
					</div>
				)}
				{showGroupDropdown && filteredGroups.length === 0 && groupInput && (
					<div className="absolute z-10 mx-auto mt-1 w-[calc(100%-4px)] rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-3 shadow-lg">
						<p className="text-paragraph-sm text-text-soft-400">
							No groups found
						</p>
					</div>
				)}
			</div>
			<p className="text-paragraph-xs text-text-soft-400">
				You can create new groups from the Groups tab.
			</p>
		</div>
	);
};
