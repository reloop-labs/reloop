import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";

interface PropertiesEmptyStateProps {
	onAddProperty?: () => void;
}

export const PropertiesEmptyState = ({
	onAddProperty,
}: PropertiesEmptyStateProps) => {
	return (
		<div className="flex flex-col items-center justify-center px-4 py-12 text-center">
			<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-bg-weak-50">
				<Icon name="sliders-horiz-2" className="h-6 w-6 text-text-sub-600" />
			</div>
			<h3 className="mb-1 font-semibold text-lg text-text-strong-950">
				No properties yet
			</h3>
			<p className="mb-6 max-w-[280px] font-normal text-sm text-text-sub-600">
				Properties let you store custom data for each contact.
			</p>
			<Button.Root
				variant="neutral"
				size="xsmall"
				onClick={onAddProperty}
				className="gap-2"
			>
				<Icon name="plus" className="h-4 w-4" />
				Add Your First Property
				<span className="inline-flex items-center gap-0.5">
					<Icon
						name="command"
						className="h-4 w-4 rounded-sm border border-stroke-soft-100/20 p-px"
					/>
					<span className="flex h-4 w-4 items-center justify-center rounded-sm border border-stroke-soft-100/20 p-px font-medium text-[10px] uppercase">
						A
					</span>
				</span>
			</Button.Root>

			{/* Help link */}
			<a
				href="https://reloop.sh/docs/properties"
				target="_blank"
				rel="noopener noreferrer"
				className="mt-4 flex items-center gap-1 text-text-sub-600 text-xs transition-colors hover:text-text-strong-950"
			>
				<Icon name="book-closed" className="h-3 w-3" />
				Learn more about properties
			</a>
		</div>
	);
};
