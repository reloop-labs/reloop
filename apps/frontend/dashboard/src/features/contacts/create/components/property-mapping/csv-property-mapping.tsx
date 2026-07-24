import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { AnimatePresence, motion } from "framer-motion";
import { useAllPropertiesQuery } from "#/features/contacts/hooks/use-contacts-query";
import {
	createEmptyPropertyRow,
	hasEmailMapping,
	type PropertyMappingRow,
} from "../../utils/property-mapping";
import { MAPPING_TABLE_GRID } from "./constants";
import { MappingRow } from "./mapping-row";

export type { PropertyMappingRow };

export type CsvPropertyMappingProps = {
	csvHeaders: string[];
	rows: PropertyMappingRow[];
	onChange: (rows: PropertyMappingRow[]) => void;
	disabled?: boolean;
};

/**
 * Domain-table style property mapping panel for CSV import.
 * Orchestrates rows only — selects live in dedicated files.
 */
export function CsvPropertyMapping({
	csvHeaders,
	rows,
	onChange,
	disabled = false,
}: CsvPropertyMappingProps) {
	const { data: propertiesData, isPending } = useAllPropertiesQuery();
	const properties = propertiesData?.properties ?? [];

	const emailMapped = hasEmailMapping(rows);
	const showEmptyState = rows.length === 0;

	const updateRow = (id: string, patch: Partial<PropertyMappingRow>) => {
		onChange(rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
	};

	const removeRow = (id: string) => {
		onChange(rows.filter((r) => r.id !== id));
	};

	const addRow = () => {
		onChange([...rows, createEmptyPropertyRow()]);
	};

	return (
		<div className="space-y-2.5 pt-1">
			<div>
				<p className="font-semibold text-text-strong-950 text-xs">
					Property mapping
				</p>
				<p className="mt-0.5 text-[11px] text-text-sub-600">
					Map CSV columns to email, name, or Reloop properties.
				</p>
			</div>

			<div className="w-full text-paragraph-sm">
				{/* Header — DomainTable tokens */}
				<div
					className={cn(
						"hidden items-center rounded-t-[14px] border-stroke-soft-100 border-t border-r border-l bg-bg-weak-50/50 px-4 pt-2.5 pb-5 font-medium text-text-sub-600 sm:grid dark:border-[#101010] dark:bg-white/[0.03]",
						MAPPING_TABLE_GRID,
					)}
				>
					<div className="flex items-center gap-1">
						<Icon name="file-download" className="h-3 w-3" />
						<span className="text-xs">CSV column</span>
					</div>
					<div aria-hidden />
					<div className="flex items-center gap-1">
						<Icon name="tag" className="h-3 w-3" />
						<span className="text-xs">Reloop field</span>
					</div>
					<div />
				</div>

				{/* Body */}
				<div className="-mt-2.5 divide-y divide-stroke-soft-100 overflow-hidden rounded-xl border border-stroke-soft-100 bg-bg-white-0 dark:divide-stroke-soft-100/50 dark:border-stroke-soft-100/40">
					{showEmptyState ? (
						<div className="flex flex-col items-center justify-center gap-1 px-4 py-8 text-center">
							<p className="text-text-sub-600 text-xs leading-relaxed">
								No columns mapped. Add a mapping below.
							</p>
						</div>
					) : (
						<AnimatePresence initial={false}>
							{rows.map((row) => (
								<MappingRow
									key={row.id}
									row={row}
									allRows={rows}
									csvHeaders={csvHeaders}
									orgProperties={properties}
									onChange={updateRow}
									onRemove={removeRow}
									disabled={disabled}
									isPendingProperties={isPending}
								/>
							))}
						</AnimatePresence>
					)}

					<motion.div
						layout
						transition={{ duration: 0.25, ease: [0.2, 0, 0, 1] }}
						className="flex items-center justify-end px-4 py-2 text-label-xs text-text-sub-600"
					>
						<button
							type="button"
							disabled={disabled}
							onClick={addRow}
							className="inline-flex cursor-pointer items-center gap-1 font-medium text-label-xs text-text-sub-600 transition-all hover:text-text-strong-950 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
						>
							<Icon name="plus" className="h-3.5 w-3.5" />
							Add mapping
						</button>
					</motion.div>
				</div>
			</div>

			{!emailMapped && rows.length > 0 && (
				<p className="text-[11px] text-error-base">
					One column must be mapped to Email Address.
				</p>
			)}
		</div>
	);
}
