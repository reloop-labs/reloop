import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";

interface PropertiesEmptyStateProps {
	onAddProperty?: () => void;
}

export const PropertiesEmptyState = ({
	onAddProperty,
}: PropertiesEmptyStateProps) => {
	return (
		<div className="flex flex-col items-center justify-center py-16">
			<div className="relative mb-4">
				<Icon name="sliders-horiz-2" className="h-8 w-8 text-natural-base" />
			</div>

			<div className="flex max-w-md flex-col items-center text-center">
				<h3 className="mb-2 font-semibold text-text-strong-950 text-xl">
					No properties yet
				</h3>
				<p className="mb-5 max-w-[250px] text-sm text-text-sub-600">
					Properties let you store custom data for each contact.
				</p>
				<div>
					<Button.Root variant="neutral" size="small" onClick={onAddProperty}>
						<Icon name="plus" className="h-4 w-4" />
						Add your first property
					</Button.Root>
				</div>

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
		</div>
	);
};
