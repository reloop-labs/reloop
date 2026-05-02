import * as DividerUI from "@reloop/ui/divider";

export function Divider({ label }: { label?: string }) {
	return (
		<div className="my-2">
			<DividerUI.Root variant={label ? "line-text" : "line"}>
				{label}
			</DividerUI.Root>
		</div>
	);
}
