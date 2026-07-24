import { Icon } from "@reloop/ui/icon";
import { SelectItem } from "#/features/api-keys/filters/base-ui-select";
import {
	IDENTITY_TARGETS,
	toPropertyTarget,
	type MappingRowTarget,
} from "../../utils/property-mapping";
import { EMPTY_VALUE } from "./constants";

export type ReloopFieldListProps = {
	value: MappingRowTarget | null;
	identityOptions: Array<"email" | "firstName" | "lastName">;
	properties: Array<{ propertyName: string; propertyType?: string }>;
	onAddProperty: () => void;
};

/**
 * List-mode contents of the Reloop field dropdown.
 * Hover animation is owned by SelectPopup (data-slot=select-item only).
 */
export function ReloopFieldList({
	value,
	identityOptions,
	properties,
	onAddProperty,
}: ReloopFieldListProps) {
	return (
		<>
			<SelectItem value={EMPTY_VALUE} className="text-xs font-medium">
				<span className="text-text-sub-600">Select field…</span>
			</SelectItem>
			{IDENTITY_TARGETS.filter(
				(t) => identityOptions.includes(t.value) || value === t.value,
			).map((t) => (
				<SelectItem key={t.value} value={t.value} className="text-xs font-medium">
					<span className="min-w-0 truncate">{t.label}</span>
				</SelectItem>
			))}
			{properties.map((p) => (
				<SelectItem
					key={p.propertyName}
					value={toPropertyTarget(p.propertyName)}
					className="text-xs font-medium"
				>
					<span className="min-w-0 truncate">
						{p.propertyName}
						{p.propertyType ? ` (${p.propertyType})` : ""}
					</span>
				</SelectItem>
			))}

			{/* Footer action — not a SelectItem, so no hover highlight */}
			<button
				type="button"
				onMouseDown={(e) => {
					e.preventDefault();
					e.stopPropagation();
				}}
				onClick={(e) => {
					e.preventDefault();
					e.stopPropagation();
					onAddProperty();
				}}
				className="relative z-10 flex min-h-8 w-full cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs text-text-strong-950 outline-none transition-colors hover:bg-bg-weak-50"
			>
				<Icon name="plus" className="h-4 w-4 shrink-0 text-text-sub-600" />
				<span className="font-medium">Add property</span>
			</button>
		</>
	);
}
