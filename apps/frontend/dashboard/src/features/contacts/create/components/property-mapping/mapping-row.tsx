import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import {
	getAvailableCsvHeaders,
	getAvailableIdentityTargets,
	getAvailableProperties,
	isIdentityTarget,
	isPropertyTarget,
	propertyTargetName,
	type PropertyMappingRow,
} from "../../utils/property-mapping";
import { CsvColumnSelect } from "./csv-column-select";
import { ReloopFieldSelect } from "./reloop-field-select";

export type MappingRowProps = {
	row: PropertyMappingRow;
	allRows: PropertyMappingRow[];
	csvHeaders: string[];
	orgProperties: Array<{ propertyName: string; propertyType?: string }>;
	onChange: (id: string, patch: Partial<PropertyMappingRow>) => void;
	onRemove: (id: string) => void;
	disabled?: boolean;
	isPendingProperties?: boolean;
};

/** Single mapping table row: CSV column → Reloop field + remove. */
export function MappingRow({
	row,
	allRows,
	csvHeaders,
	orgProperties,
	onChange,
	onRemove,
	disabled = false,
	isPendingProperties = false,
}: MappingRowProps) {
	let leftOptions = getAvailableCsvHeaders(csvHeaders, allRows, row.id);
	if (row.csvHeader && !leftOptions.includes(row.csvHeader)) {
		leftOptions = [row.csvHeader, ...leftOptions];
	}

	let identityOptions = getAvailableIdentityTargets(allRows, row.id);
	if (isIdentityTarget(row.target) && !identityOptions.includes(row.target)) {
		identityOptions = [row.target, ...identityOptions];
	}

	let rightProperties = getAvailableProperties(orgProperties, allRows, row.id);
	if (
		isPropertyTarget(row.target) &&
		!rightProperties.some(
			(p) => p.propertyName === propertyTargetName(row.target),
		)
	) {
		rightProperties = [
			{ propertyName: propertyTargetName(row.target) },
			...rightProperties,
		];
	}

	return (
		<div
			className={cn(
				"group/row grid w-full items-center gap-2 px-4 py-2 text-left transition-colors sm:gap-2",
				"hover:bg-bg-weak-50/40",
				"grid-cols-1 sm:grid-cols-[minmax(0,1fr)_32px_minmax(0,1fr)_32px]",
			)}
		>
			<div className="min-w-0">
				<span className="mb-1 block font-medium text-[10px] text-text-sub-600 sm:sr-only">
					CSV column
				</span>
				<CsvColumnSelect
					value={row.csvHeader}
					options={leftOptions}
					onChange={(csvHeader) => onChange(row.id, { csvHeader })}
					disabled={disabled}
				/>
			</div>

			<div className="hidden items-center justify-center sm:flex">
				<span className="sr-only">maps to</span>
				<Icon
					name="arrow-right"
					className="h-3.5 w-3.5 shrink-0 text-text-soft-400"
				/>
			</div>

			<div className="min-w-0">
				<span className="mb-1 block font-medium text-[10px] text-text-sub-600 sm:sr-only">
					Reloop field
				</span>
				<ReloopFieldSelect
					value={row.target}
					onChange={(target) => onChange(row.id, { target })}
					identityOptions={identityOptions}
					properties={rightProperties}
					createPrefill={row.csvHeader ?? ""}
					disabled={disabled}
					isPending={isPendingProperties}
				/>
			</div>

			<div className="flex items-center justify-end text-text-soft-400 sm:justify-center">
				<button
					type="button"
					disabled={disabled}
					onClick={() => onRemove(row.id)}
					className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-text-sub-600 opacity-70 transition-all hover:bg-bg-weak-50 hover:text-text-strong-950 hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-40 group-hover/row:opacity-100"
					aria-label="Remove mapping"
				>
					<Icon name="cross" className="h-3.5 w-3.5" />
				</button>
			</div>
		</div>
	);
}
