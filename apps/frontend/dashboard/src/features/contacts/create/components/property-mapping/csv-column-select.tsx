import { cn } from "@reloop/ui/cn";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/features/api-keys/filters/base-ui-select";
import { EMPTY_VALUE, TABLE_SELECT_TRIGGER_CLASS } from "./constants";

export type CsvColumnSelectProps = {
	value: string | null;
	options: string[];
	onChange: (csvHeader: string | null) => void;
	disabled?: boolean;
};

/** Left-side select: pick which CSV column feeds this mapping row. */
export function CsvColumnSelect({
	value,
	options,
	onChange,
	disabled = false,
}: CsvColumnSelectProps) {
	const selectValue = value ?? EMPTY_VALUE;

	return (
		<Select
			value={selectValue}
			disabled={disabled}
			onValueChange={(val) =>
				onChange(!val || val === EMPTY_VALUE ? null : String(val))
			}
		>
			<SelectTrigger size="sm" className={TABLE_SELECT_TRIGGER_CLASS}>
				<SelectValue placeholder="Select column…">
					<span
						className={cn(
							"min-w-0 truncate font-mono text-[11px]",
							!value && "text-text-sub-600",
						)}
					>
						{value ?? "Select column…"}
					</span>
				</SelectValue>
			</SelectTrigger>
			<SelectContent
				className="min-w-(--anchor-width)"
				alignItemWithTrigger={false}
			>
				<SelectItem value={EMPTY_VALUE}>
					<span className="text-text-sub-600">—</span>
				</SelectItem>
				{options.map((header) => (
					<SelectItem key={header} value={header}>
						<span className="min-w-0 truncate font-mono text-[11px]">
							{header}
						</span>
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
