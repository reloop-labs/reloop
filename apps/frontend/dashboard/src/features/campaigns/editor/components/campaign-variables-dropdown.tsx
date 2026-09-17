import { cn } from "@reloop/ui/cn";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { useAllPropertiesQuery } from "#/features/contacts/hooks/use-contacts-query";
import {
	isSystemCampaignVariable,
	mapContactPropertiesToVariables,
	SYSTEM_CAMPAIGN_VARIABLES,
} from "../lib/campaign-variables";
import {
	DEFAULT_UNSUBSCRIBE_LINK_TITLE,
	UNSUBSCRIBE_URL_VARIABLE,
} from "../lib/unsubscribe-link";

interface CampaignVariablesDropdownProps {
	query: string;
	editor: any;
	range: any;
	clientRect?: (() => DOMRect | null) | DOMRect | null;
	command: (props: {
		name: string;
		insert?: "unsubscribeLink";
		title?: string;
	}) => void;
}

export const CampaignVariablesDropdown = forwardRef(
	(props: CampaignVariablesDropdownProps, ref) => {
		const { data: propertiesData } = useAllPropertiesQuery();

		const rawProperties = propertiesData?.properties ?? [];
		// Campaign variables are read-only and come only from contact properties.
		// No creation or editing here — manage properties under Contacts.
		// Standard fields (email/firstName/lastName) are always included first.
		const variables = mapContactPropertiesToVariables(rawProperties);

		const [selectedIndex, setSelectedIndex] = useState(0);

		// Filter based on the query typed after '{{'
		const query = props.query.toLowerCase();
		const filteredContacts = variables.filter((v: string) =>
			v.toLowerCase().includes(query),
		);
		const filteredSystem = (
			SYSTEM_CAMPAIGN_VARIABLES as readonly string[]
		).filter((v) => v.toLowerCase().includes(query));
		// Single flat list for keyboard nav; sections are visual only.
		const filtered = [...filteredContacts, ...filteredSystem];

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
			if (name === undefined) return;
			if (isSystemCampaignVariable(name)) {
				props.command({
					name,
					insert: "unsubscribeLink",
					title: DEFAULT_UNSUBSCRIBE_LINK_TITLE,
				});
				return;
			}
			props.command({ name });
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

				{filteredContacts.length === 0 ? (
					<div className="px-2.5 py-1.5 text-paragraph-xs text-text-soft-400 italic">
						No matching contact properties
					</div>
				) : (
					filteredContacts.map((item: string) => {
						const index = filtered.indexOf(item);
						return (
							<button
								key={item}
								type="button"
								onMouseDown={preventEditorBlur}
								onClick={() => selectItem(index)}
								className={itemClass(index === selectedIndex)}
							>
								<span className="truncate font-mono">{`{{{ ${item} }}}`}</span>
							</button>
						);
					})
				)}

				{filteredSystem.length > 0 && (
					<>
						<div className="px-2.5 pt-2 pb-1 font-semibold text-[10px] text-text-soft-400 uppercase tracking-wider">
							System
						</div>
						{filteredSystem.map((item: string) => {
							const index = filtered.indexOf(item);
							return (
								<button
									key={item}
									type="button"
									onMouseDown={preventEditorBlur}
									onClick={() => selectItem(index)}
									className={itemClass(index === selectedIndex)}
								>
									<span className="flex min-w-0 flex-col">
										<span className="truncate">
											{DEFAULT_UNSUBSCRIBE_LINK_TITLE}
										</span>
										<span className="truncate font-mono text-[10px] text-text-soft-400">
											{`{{{ ${UNSUBSCRIBE_URL_VARIABLE} }}}`}
										</span>
									</span>
								</button>
							);
						})}
					</>
				)}
			</div>
		);
	},
);

CampaignVariablesDropdown.displayName = "CampaignVariablesDropdown";
