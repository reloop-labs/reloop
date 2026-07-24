import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { useState } from "react";
import {
	useAllPropertiesQuery,
	type Property,
} from "#/features/contacts/hooks/use-contacts-query";
import {
	countCustomPropertyMappings,
	createEmptyPropertyRow,
	getAvailableCsvHeaders,
	getAvailableIdentityTargets,
	getAvailableProperties,
	hasEmailMapping,
	IDENTITY_TARGETS,
	isIdentityTarget,
	isPropertyTarget,
	isRowComplete,
	propertyTargetName,
	toPropertyTarget,
	type MappingRowTarget,
	type PropertyMappingRow,
} from "../utils/property-mapping";
import { CsvInlineCreateProperty } from "./csv-inline-create-property";

export type { PropertyMappingRow };

export type CsvPropertyMappingProps = {
	csvHeaders: string[];
	rows: PropertyMappingRow[];
	onChange: (rows: PropertyMappingRow[]) => void;
	disabled?: boolean;
};

/** Domain-table style grid: CSV | arrow | Reloop | actions */
const MAPPING_TABLE_GRID =
	"grid-cols-[minmax(0,1fr)_32px_minmax(0,1fr)_32px]";

const selectBase =
	"w-full min-w-0 cursor-pointer rounded-lg border border-transparent bg-transparent px-1.5 py-1 text-text-strong-950 outline-none transition-colors hover:border-stroke-soft-200 hover:bg-bg-weak-50/60 focus:border-stroke-soft-300 focus:bg-bg-white-0 disabled:cursor-not-allowed disabled:opacity-50";

function targetSelectValue(target: MappingRowTarget | null): string {
	return target ?? "";
}

function parseTargetSelectValue(value: string): MappingRowTarget | null {
	if (!value) return null;
	if (value === "email" || value === "firstName" || value === "lastName") {
		return value;
	}
	if (value.startsWith("property:")) {
		return value as `property:${string}`;
	}
	return toPropertyTarget(value);
}

export function CsvPropertyMapping({
	csvHeaders,
	rows,
	onChange,
	disabled = false,
}: CsvPropertyMappingProps) {
	const { data: propertiesData, isPending } = useAllPropertiesQuery();
	const properties = propertiesData?.properties ?? [];

	const [isCreating, setIsCreating] = useState(false);
	const [createPrefill, setCreatePrefill] = useState("");

	const completeCount = rows.filter(isRowComplete).length;
	const customCount = countCustomPropertyMappings(rows);
	const emailMapped = hasEmailMapping(rows);

	const updateRow = (id: string, patch: Partial<PropertyMappingRow>) => {
		onChange(rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
	};

	const removeRow = (id: string) => {
		onChange(rows.filter((r) => r.id !== id));
	};

	const addRow = () => {
		onChange([...rows, createEmptyPropertyRow()]);
	};

	const openCreate = (prefill = "") => {
		setCreatePrefill(prefill);
		setIsCreating(true);
	};

	const handleCreated = (
		property: Pick<Property, "id" | "propertyName" | "propertyType">,
	) => {
		setIsCreating(false);
		setCreatePrefill("");

		const target = toPropertyTarget(property.propertyName);

		const incompleteWithHeader = rows.find((r) => r.csvHeader && !r.target);
		if (incompleteWithHeader) {
			onChange(
				rows.map((r) =>
					r.id === incompleteWithHeader.id ? { ...r, target } : r,
				),
			);
			return;
		}

		onChange([
			...rows,
			{
				id: crypto.randomUUID(),
				csvHeader: null,
				target,
			},
		]);
	};

	const showEmptyState = rows.length === 0;

	return (
		<div className="space-y-2.5 pt-1">
			{/* Section title row (outside table) */}
			<div className="flex flex-wrap items-center justify-between gap-2">
				<div className="flex items-center gap-2">
					<p className="font-semibold text-text-strong-950 text-xs">
						Property mapping
					</p>
					{completeCount > 0 && (
						<span className="inline-flex items-center rounded-full border border-stroke-soft-200 bg-bg-weak-50 px-2 py-0.5 font-medium text-[10px] text-text-sub-600 tabular-nums">
							{completeCount} mapped
							{customCount > 0 ? ` · ${customCount} custom` : ""}
						</span>
					)}
				</div>

				<button
					type="button"
					disabled={disabled || isCreating}
					onClick={() => openCreate()}
					className="inline-flex cursor-pointer items-center gap-1 font-medium text-text-sub-600 text-xs transition-colors hover:text-text-strong-950 disabled:cursor-not-allowed disabled:opacity-50"
				>
					<Icon name="plus" className="h-3.5 w-3.5" />
					Create new property
				</button>
			</div>

			<p className="text-[11px] text-text-sub-600">
				Map CSV columns to email, name, or Reloop properties.
			</p>

			{/* Domain table pattern: weak header strip + overlapping white body */}
			<div className="w-full text-paragraph-sm">
				{/* Header — same tokens as DomainTable */}
				<div
					className={cn(
						"hidden items-center rounded-t-[14px] border-stroke-soft-100 border-t border-r border-l bg-bg-weak-50/50 px-4 pt-2.5 pb-5 font-medium text-text-sub-600 dark:border-[#101010] dark:bg-white/[0.03] sm:grid",
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

				{/* Body — overlaps header with -mt-2.5, like DomainTable */}
				<div className="-mt-2.5 divide-y divide-stroke-soft-100 overflow-hidden rounded-xl border border-stroke-soft-100 bg-bg-white-0 dark:divide-stroke-soft-100/50 dark:border-stroke-soft-100/40">
					{showEmptyState ? (
						<div className="flex flex-col items-center justify-center gap-1 px-4 py-8 text-center">
							<p className="text-text-sub-600 text-xs leading-relaxed">
								No columns mapped. Add a mapping or create a new property.
							</p>
						</div>
					) : (
						rows.map((row) => {
							let leftOptions = getAvailableCsvHeaders(
								csvHeaders,
								rows,
								row.id,
							);
							if (row.csvHeader && !leftOptions.includes(row.csvHeader)) {
								leftOptions = [row.csvHeader, ...leftOptions];
							}

							let identityOptions = getAvailableIdentityTargets(
								rows,
								row.id,
							);
							if (
								isIdentityTarget(row.target) &&
								!identityOptions.includes(row.target)
							) {
								identityOptions = [row.target, ...identityOptions];
							}

							let rightProperties = getAvailableProperties(
								properties,
								rows,
								row.id,
							);
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

							const incomplete = !isRowComplete(row);

							return (
								<div
									key={row.id}
									className={cn(
										"group/row grid w-full items-center gap-2 px-4 py-2 text-left transition-colors sm:gap-0",
										"hover:bg-bg-weak-50/40",
										// Mobile: stack; desktop: domain table grid
										"grid-cols-1 sm:grid-cols-[minmax(0,1fr)_32px_minmax(0,1fr)_32px]",
									)}
								>
									{/* CSV column */}
									<div className="min-w-0">
										<label
											className="mb-1 block font-medium text-[10px] text-text-sub-600 sm:sr-only"
											htmlFor={`csv-from-${row.id}`}
										>
											CSV column
										</label>
										<select
											id={`csv-from-${row.id}`}
											value={row.csvHeader ?? ""}
											disabled={disabled}
											onChange={(e) =>
												updateRow(row.id, {
													csvHeader: e.target.value || null,
												})
											}
											className={cn(
												selectBase,
												"font-mono text-[11px]",
												!row.csvHeader && "text-text-sub-600",
											)}
										>
											<option value="">
												{incomplete && !row.csvHeader
													? "Select column…"
													: "—"}
											</option>
											{leftOptions.map((header) => (
												<option key={header} value={header}>
													{header}
												</option>
											))}
										</select>
									</div>

									{/* Arrow */}
									<div className="hidden items-center justify-center sm:flex">
										<span className="sr-only">maps to</span>
										<Icon
											name="arrow-right"
											className="h-3.5 w-3.5 shrink-0 text-text-soft-400"
										/>
									</div>

									{/* Reloop field */}
									<div className="min-w-0">
										<label
											className="mb-1 block font-medium text-[10px] text-text-sub-600 sm:sr-only"
											htmlFor={`csv-to-${row.id}`}
										>
											Reloop field
										</label>
										<select
											id={`csv-to-${row.id}`}
											value={targetSelectValue(row.target)}
											disabled={disabled || isPending}
											onChange={(e) =>
												updateRow(row.id, {
													target: parseTargetSelectValue(e.target.value),
												})
											}
											className={cn(
												selectBase,
												"font-sans text-xs",
												!row.target && "text-text-sub-600",
											)}
										>
											<option value="">
												{isPending ? "Loading…" : "Select field…"}
											</option>
											<optgroup label="Contact fields">
												{IDENTITY_TARGETS.filter(
													(t) =>
														identityOptions.includes(t.value) ||
														row.target === t.value,
												).map((t) => (
													<option key={t.value} value={t.value}>
														{t.label}
													</option>
												))}
											</optgroup>
											{rightProperties.length > 0 && (
												<optgroup label="Custom properties">
													{rightProperties.map((p) => (
														<option
															key={p.propertyName}
															value={toPropertyTarget(p.propertyName)}
														>
															{p.propertyName}
															{p.propertyType ? ` (${p.propertyType})` : ""}
														</option>
													))}
												</optgroup>
											)}
										</select>
									</div>

									{/* Actions */}
									<div className="flex items-center justify-end sm:justify-center text-text-soft-400">
										<button
											type="button"
											disabled={disabled}
											onClick={() => removeRow(row.id)}
											className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-text-sub-600 opacity-70 transition-all hover:bg-bg-weak-50 hover:text-text-strong-950 hover:opacity-100 group-hover/row:opacity-100 disabled:cursor-not-allowed disabled:opacity-40"
											aria-label="Remove mapping"
										>
											<Icon name="cross" className="h-3.5 w-3.5" />
										</button>
									</div>
								</div>
							);
						})
					)}

					{/* Footer inside white card — Add mapping on the right (like domain table footer) */}
					{!isCreating && (
						<div className="flex items-center justify-end px-4 py-2 text-label-xs text-text-sub-600">
							<button
								type="button"
								disabled={disabled}
								onClick={addRow}
								className="inline-flex cursor-pointer items-center gap-1 font-medium text-label-xs text-text-sub-600 transition-colors hover:text-text-strong-950 disabled:cursor-not-allowed disabled:opacity-50"
							>
								<Icon name="plus" className="h-3.5 w-3.5" />
								Add mapping
							</button>
						</div>
					)}
				</div>
			</div>

			{!emailMapped && rows.length > 0 && (
				<p className="text-[11px] text-error-base">
					One column must be mapped to Email Address.
				</p>
			)}

			{/* Inline create — below table */}
			{isCreating && (
				<CsvInlineCreateProperty
					initialName={createPrefill}
					disabled={disabled}
					onCancel={() => {
						setIsCreating(false);
						setCreatePrefill("");
					}}
					onCreated={handleCreated}
				/>
			)}

			{properties.length === 0 &&
				!isPending &&
				!isCreating &&
				rows.length > 0 && (
					<p className="text-[11px] text-text-sub-600">
						No custom properties yet.{" "}
						<button
							type="button"
							disabled={disabled}
							onClick={() => openCreate()}
							className="font-medium underline underline-offset-2 hover:text-text-strong-950"
						>
							Create one
						</button>{" "}
						to map extra CSV columns.
					</p>
				)}
		</div>
	);
}
