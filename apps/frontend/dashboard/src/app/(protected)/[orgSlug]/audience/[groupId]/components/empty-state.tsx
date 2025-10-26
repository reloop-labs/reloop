import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";

export const EmptyState = () => {
	return (
		<div className="mt-20 flex items-center justify-center">
			<div className="flex flex-col items-center justify-center gap-4">
				<Icon name="users" className="h-12 w-12" />
				<div>
					<p className="text-center font-semibold text-2xl">No audiences</p>
					<p className="max-w-72 text-center text-paragraph-sm text-text-sub-600">
						Add your first audience or import contacts from a CSV file.
					</p>
				</div>
				<div className="flex gap-2">
					<Button.Root
						variant="neutral"
						size="small"
						onClick={() => {
							// This will be handled by the parent component
							const event = new CustomEvent("openAddAudience");
							window.dispatchEvent(event);
						}}
					>
						<Icon name="user-plus" className="h-4 w-4" />
						Add manually
					</Button.Root>
					<Button.Root
						variant="neutral"
						mode="stroke"
						size="small"
						onClick={() => {
							// This will be handled by the parent component
							const event = new CustomEvent("openBulkImport");
							window.dispatchEvent(event);
						}}
					>
						<Icon name="file-upload" className="h-4 w-4" />
						Import CSV
					</Button.Root>
				</div>
			</div>
		</div>
	);
};
