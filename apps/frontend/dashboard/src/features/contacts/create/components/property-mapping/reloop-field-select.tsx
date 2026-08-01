import { cn } from "@reloop/ui/cn";
import { useState } from "react";
import {
	Select,
	SelectContent,
	SelectTrigger,
	SelectValue,
} from "#/features/api-keys/filters/base-ui-select";
import type { Property } from "#/features/contacts/hooks/use-contacts-query";
import {
	isPropertyTarget,
	type MappingRowTarget,
	propertyTargetName,
	toPropertyTarget,
} from "../../utils/property-mapping";
import { EMPTY_VALUE, TABLE_SELECT_TRIGGER_CLASS } from "./constants";
import { CreatePropertyForm } from "./create-property-form";
import { ReloopFieldList } from "./reloop-field-list";

function targetSelectValue(target: MappingRowTarget | null): string {
	return target ?? EMPTY_VALUE;
}

function parseTargetSelectValue(value: string): MappingRowTarget | null {
	if (!value || value === EMPTY_VALUE) return null;
	if (value === "email" || value === "firstName" || value === "lastName") {
		return value;
	}
	if (value.startsWith("property:")) {
		return value as `property:${string}`;
	}
	return toPropertyTarget(value);
}

function targetLabel(
	target: MappingRowTarget | null,
	isPending: boolean,
): string {
	if (!target) return isPending ? "Loading…" : "Select field…";
	if (target === "email") return "Email Address (Required)";
	if (target === "firstName") return "First Name";
	if (target === "lastName") return "Last Name";
	if (isPropertyTarget(target)) return propertyTargetName(target);
	return "Select field…";
}

export type ReloopFieldSelectProps = {
	value: MappingRowTarget | null;
	onChange: (target: MappingRowTarget | null) => void;
	identityOptions: Array<"email" | "firstName" | "lastName">;
	properties: Array<{ propertyName: string; propertyType?: string }>;
	createPrefill?: string;
	disabled?: boolean;
	isPending?: boolean;
};

/**
 * Right-side Reloop field select.
 * Modes: `list` (pick a field) | `create` (inline create form).
 * Hover is handled by SelectPopup via data-slot=select-item.
 */
export function ReloopFieldSelect({
	value,
	onChange,
	identityOptions,
	properties,
	createPrefill = "",
	disabled = false,
	isPending = false,
}: ReloopFieldSelectProps) {
	const [open, setOpen] = useState(false);
	const [mode, setMode] = useState<"list" | "create">("list");

	const fieldValue = targetSelectValue(value);
	const fieldDisplay = targetLabel(value, isPending);

	const handleOpenChange = (next: boolean) => {
		setOpen(next);
		if (!next) setMode("list");
	};

	const handleCreated = (
		property: Pick<Property, "id" | "propertyName" | "propertyType">,
	) => {
		onChange(toPropertyTarget(property.propertyName));
		setMode("list");
		setOpen(true);
	};

	return (
		<Select
			value={fieldValue}
			disabled={disabled || isPending}
			open={open}
			onOpenChange={handleOpenChange}
			onValueChange={(val) => {
				if (mode === "create") return;
				onChange(parseTargetSelectValue(String(val ?? "")));
			}}
		>
			<SelectTrigger size="sm" className={TABLE_SELECT_TRIGGER_CLASS}>
				<SelectValue placeholder="Select field…">
					<span
						className={cn(
							"min-w-0 truncate text-xs",
							!value && "text-text-sub-600",
						)}
					>
						{fieldDisplay}
					</span>
				</SelectValue>
			</SelectTrigger>
			<SelectContent
				className={cn(
					"transition-[min-width,width] duration-150 ease-out",
					mode === "create"
						? "w-[min(320px,calc(100vw-2rem))] min-w-[min(320px,calc(100vw-2rem))]"
						: "min-w-(--anchor-width)",
				)}
				alignItemWithTrigger={false}
			>
				{mode === "list" ? (
					<ReloopFieldList
						value={value}
						identityOptions={identityOptions}
						properties={properties}
						onAddProperty={() => setMode("create")}
					/>
				) : (
					<div
						className="w-full"
						onMouseDown={(e) => {
							e.preventDefault();
							e.stopPropagation();
						}}
						onPointerDown={(e) => e.stopPropagation()}
					>
						<CreatePropertyForm
							variant="dropdown"
							initialName={createPrefill}
							disabled={disabled}
							onCancel={() => setMode("list")}
							onCreated={handleCreated}
						/>
					</div>
				)}
			</SelectContent>
		</Select>
	);
}
