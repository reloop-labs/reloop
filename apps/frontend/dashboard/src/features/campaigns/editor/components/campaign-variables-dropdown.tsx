import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { useAllPropertiesQuery } from "#/features/contacts/hooks/use-contacts-query";

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
		const rawVariables = rawProperties.map((p) =>
			p.propertyName.startsWith("contact.")
				? p.propertyName
				: `contact.${p.propertyName}`,
		);

		// If no custom properties yet, provide standard contact variables
		const variables =
			rawVariables.length === 0
				? ["contact.email", "contact.firstName", "contact.lastName"]
				: rawVariables;

		const [selectedIndex, setSelectedIndex] = useState(0);

		// Filter based on the query typed after '{{'
		const filtered = variables.filter((v: string) =>
			v.toLowerCase().includes(props.query.toLowerCase()),
		);

		const totalItems = filtered.length + 1;

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
			if (index < filtered.length) {
				const name = filtered[index];
				if (name !== undefined) {
					props.command({ name });
				}
			} else {
				// "+ Add variable..." option -> Open contacts properties page
				const { editor, range } = props;
				editor.chain().focus().deleteRange(range).run();

				window.open("/dashboard/contacts/properties", "_blank");
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
					Variables
				</div>

				{filtered.length === 0 ? (
					<div className="px-2.5 py-1.5 text-paragraph-xs text-text-soft-400 italic">
						No matching variables
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

				<div className="my-1 border-stroke-soft-100 border-t dark:border-stroke-soft-100/40" />

				<button
					type="button"
					onMouseDown={preventEditorBlur}
					onClick={() => selectItem(filtered.length)}
					className={cn(
						itemClass(selectedIndex === filtered.length),
						"font-semibold",
					)}
				>
					<Icon name="plus" className="h-3 w-3 shrink-0" />
					<span className="truncate">Add variable...</span>
				</button>
			</div>
		);
	},
);

CampaignVariablesDropdown.displayName = "CampaignVariablesDropdown";
