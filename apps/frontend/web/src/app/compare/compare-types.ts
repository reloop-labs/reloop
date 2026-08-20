export type ComparisonCell =
	| string
	| {
			value: string;
			note?: string;
	  };

export interface ComparisonFeatureRow {
	label: string;
	icon?: string;
	reloop: ComparisonCell;
	competitor: ComparisonCell;
}

export type ComparisonCategory = {
	id: string;
	label: string;
	icon?: string;
	intro?: string;
	features: ComparisonFeatureRow[];
};

export function comparisonCellText(cell: ComparisonCell): string {
	if (typeof cell === "string") {
		return cell;
	}
	return cell.note ? `${cell.value} (${cell.note})` : cell.value;
}
