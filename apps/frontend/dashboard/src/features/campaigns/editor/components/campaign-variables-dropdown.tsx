import { cn } from "@reloop/ui/cn";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { useAllPropertiesQuery } from "#/features/contacts/hooks/use-contacts-query";
import { mapContactPropertiesToVariables } from "../lib/campaign-variables";

interface CampaignVariablesDropdownProps {
	query: string;
	editor: any;
	range: any;
	clientRect?: (() => DOMRect | null) | DOMRect | null;
	command: (props: { name: string }) => void;
}

export const CampaignVariablesDropdown = forwardRef(
	(props: CampaignVariablesDropdownProps, ref) => {
		const { data: propertiesData } = useAllPropertiesQuery();

		const rawProperties = propertiesData?.properties ?? [];
		// Campaign variables are read-only and come only from contact properties.
		// No creation or editing here — manage properties under Contacts.
		const mapped = mapContactPropertiesToVariables(rawProperties);

		// If no custom properties yet, provide standard contact variables
		const variables =
			mapped.length === 0
				? ["contact.email", "contact.firstName", "contact.lastName"]
				: mapped;

		const [selectedIndex, setSelectedIndex] = useState(0);

		// Filter based on the query typed after '{{'
		const filtered = variables.filter((v: string) =>
			v.toLowerCase().includes(props.query.toLowerCase()),
		);

		const totalItems = filtered.length;

		// Keyboard navigation support
		useImperativeHandle(ref, () => ({
			onKeyDown: ({ event }: { event: KeyboardEvent }) => {
				if (totalItems === 0) return false;

				if (event.key === "ArrowDown") {
					setSelectedIndex((selectedIndex + 1) % totalItems);
					return true;
				}

				if (event.key === "ArrowUp") {
					setSelectedIndex((selectedIndex - 1 + totalItems) % totalItems);
					return true;
				}

				if (event.key === "Enter") {
					selectItem(selectedIndex);
					return true;
				}

				return false;
			},
		}));

		useEffect(() => {
			setSelectedIndex(0);
		}, [props.query]);

		const selectItem = (index: number) => {
			const name = filtered[index];
			if (name !== undefined) {
				props.command({ name });
			}
		};

		const preventEditorBlur = (e: React.MouseEvent) => {
			// Keep suggestion open until click handler runs (TipTap closes on blur)
			e.preventDefault();
		};

		const itemClass = (isSelected: boolean) =>
			cn(
				"flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left font-medium text-label-xs transition-colors",
				isSelected
					? "bg-bg-weak-50 text-text-strong-950"
					: "text-text-sub-600 hover:bg-bg-weak-50 hover:text-text-strong-950",
			);

		return (
			<div className="z-50 min-w-[220px] select-none rounded-2xl bg-bg-white-0 p-1.5 shadow-regular-md ring-1 ring-stroke-soft-100 ring-inset dark:ring-stroke-soft-100/50">
				<div className="px-2.5 py-1 font-semibold text-[10px] text-text-soft-400 uppercase tracking-wider">
					Contact properties
				</div>

				{filtered.length === 0 ? (
					<div className="px-2.5 py-1.5 text-paragraph-xs text-text-soft-400 italic">
						No matching contact properties
					</div>
				) : (
					filtered.map((item: string, index: number) => {
						const isSelected = index === selectedIndex;
						return (
							<button
								key={item}
								type="button"
								onMouseDown={preventEditorBlur}
								onClick={() => selectItem(index)}
								className={itemClass(isSelected)}
							>
								<span className="truncate font-mono">{`{{{ ${item} }}}`}</span>
							</button>
						);
					})
				)}
			</div>
		);
	},
);

CampaignVariablesDropdown.displayName = "CampaignVariablesDropdown";
