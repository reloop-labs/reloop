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

		// Prefer attaching to an incomplete row that already has a CSV header
		const incompleteWithHeader = rows.find((r) => r.csvHeader && !r.target);
		if (incompleteWithHeader) {
			onChange(
				rows.map((r) =>
					r.id === incompleteWithHeader.id ? { ...r, target } : r,
				),
			);
			return;
		}

		// New row with property pre-selected (empty left is OK)
		onChange([
			...rows,
			{
				id: crypto.randomUUID(),
				csvHeader: null,
				target,
			},
		]);
	};

	const showEmptyState = rows.length === 0 && !isCreating;

	return (
		<div className="space-y-2.5 pt-1">
			{/* Header */}
			<div className="flex flex-wrap items-center justify-between gap-2">
				<div className="flex items-center gap-2">
					<p className="font-semibold text-text-strong-950 text-xs">
						Property mapping
					</p>
					{completeCount > 0 && (
						<span className="inline-flex items-center rounded-full border border-stroke-soft-200 bg-bg-weak-50 px-2 py-0.5 font-medium text-[10px] text-text-sub-600 tabular-nums">
							{completeCount} mapped
							{customCount > 0
								? ` · ${customCount} custom`
								: ""}
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

			{/* Mapping list / empty state */}
			{showEmptyState ? (
				<div className="flex flex-col items-center justify-center gap-1 rounded-xl border border-stroke-soft-200 border-dashed bg-bg-weak-50/30 px-4 py-6 text-center">
					<p className="text-text-sub-600 text-xs leading-relaxed">
						No columns mapped. Add a mapping or create a new property.
					</p>
				</div>
			) : rows.length > 0 ? (
				<div className="divide-y divide-stroke-soft-200 overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-white-0">
					{rows.map((row) => {
						let leftOptions = getAvailableCsvHeaders(
							csvHeaders,
							rows,
							row.id,
						);
						if (row.csvHeader && !leftOptions.includes(row.csvHeader)) {
							leftOptions = [row.csvHeader, ...leftOptions];
						}

						let identityOptions = getAvailableIdentityTargets(rows, row.id);
						// Keep current identity target in the list if selected
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
								className="grid grid-cols-12 items-center gap-y-2 px-3 py-2.5 text-xs transition-colors hover:bg-bg-weak-50/40 sm:px-4"
							>
								{/* Left: CSV header */}
								<div className="col-span-12 sm:col-span-5">
									<label className="sr-only" htmlFor={`csv-from-${row.id}`}>
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
										className="w-full cursor-pointer rounded-lg border border-stroke-soft-200 bg-bg-weak-50 px-2.5 py-1.5 font-mono text-[11px] text-text-strong-950 outline-none transition-colors hover:border-stroke-soft-300 focus:border-stroke-strong-950 disabled:cursor-not-allowed disabled:opacity-50"
									>
										<option value="">
											{incomplete && !row.csvHeader
												? "Select CSV column…"
												: "—"}
										</option>
										{leftOptions.map((header) => (
											<option key={header} value={header}>
												{header}
											</option>
										))}
									</select>
								</div>

								{/* Center: arrow */}
								<div className="col-span-12 hidden items-center justify-center sm:col-span-1 sm:flex">
									<span className="sr-only">maps to</span>
									<Icon
										name="arrow-right"
										className="h-3.5 w-3.5 shrink-0 text-text-sub-600"
									/>
								</div>

								{/* Right: target + remove */}
								<div className="col-span-12 flex items-center gap-2 sm:col-span-6">
									<label className="sr-only" htmlFor={`csv-to-${row.id}`}>
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
										className="min-w-0 flex-1 cursor-pointer rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-2.5 py-1.5 font-sans text-text-strong-950 text-xs outline-none transition-colors hover:border-stroke-soft-300 focus:border-stroke-strong-950 disabled:cursor-not-allowed disabled:opacity-50"
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

									<button
										type="button"
										disabled={disabled}
										onClick={() => removeRow(row.id)}
										className="inline-flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-text-sub-600 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 disabled:cursor-not-allowed disabled:opacity-50"
										aria-label="Remove mapping"
									>
										<Icon name="cross" className="h-3.5 w-3.5" />
									</button>
								</div>
							</div>
						);
					})}
				</div>
			) : null}

			{!emailMapped && rows.length > 0 && (
				<p className="text-[11px] text-error-base">
					One column must be mapped to Email Address.
				</p>
			)}

			{/* Inline create */}
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

			{/* Footer actions */}
			{!isCreating && (
				<div className="flex flex-wrap items-center gap-3">
					<button
						type="button"
						disabled={disabled}
						onClick={addRow}
						className="inline-flex cursor-pointer items-center gap-1 font-medium text-text-sub-600 text-xs transition-colors hover:text-text-strong-950 disabled:cursor-not-allowed disabled:opacity-50"
					>
						<Icon name="plus" className="h-3.5 w-3.5" />
						Add mapping
					</button>

					{rows.length === 0 && (
						<button
							type="button"
							disabled={disabled}
							onClick={() => openCreate()}
							className="inline-flex cursor-pointer items-center gap-1 font-medium text-text-sub-600 text-xs transition-colors hover:text-text-strong-950 disabled:cursor-not-allowed disabled:opacity-50"
						>
							<Icon name="tag" className="h-3.5 w-3.5" />
							Create new property
						</button>
					)}
				</div>
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
