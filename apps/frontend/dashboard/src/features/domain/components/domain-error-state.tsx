import { Icon } from "@reloop/ui/icon";

export function DomainErrorState({
	message = "Failed to load domains",
}: {
	message?: string;
} = {}) {
	return (
		<div className="mx-auto max-w-3xl sm:px-8">
			<div className="flex flex-col items-center justify-center gap-2 p-4">
				<Icon name="alert-circle" className="h-8 w-8 text-error-base" />
				<p className="text-center text-sm text-text-sub-600">{message}</p>
			</div>
		</div>
	);
}
