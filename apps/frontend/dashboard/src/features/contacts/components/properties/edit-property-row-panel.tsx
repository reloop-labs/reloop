import { EditPropertyForm } from "./edit-property-form";

interface EditPropertyRowPanelProps {
	property: {
		id: string;
		propertyName: string;
		propertyType: string;
		defaultValue: string | null;
	};
	onClose: () => void;
}

export function EditPropertyRowPanel({
	property,
	onClose,
}: EditPropertyRowPanelProps) {
	return (
		<div
			className="border-stroke-soft-100 border-t bg-bg-weak-50/40 px-4 py-4 dark:bg-bg-weak-50/20"
			onClick={(e) => e.stopPropagation()}
		>
			<EditPropertyForm
				property={property}
				variant="inline"
				onCancel={onClose}
				onSuccess={onClose}
			/>
		</div>
	);
}
