import { Icon } from "@reloop/ui/icon";
import type { ReactElement } from "react";

/**
 * Error state shown in place of an email table. The toolbar stays above it,
 * so the user can change filters or search, or retry the request.
 */
export function EmailListError({
	message,
	onRetry,
}: {
	message: string;
	onRetry: () => void;
}): ReactElement {
	return (
		<div className="flex flex-col items-center justify-center gap-2 rounded-[14px] border border-stroke-soft-100 px-4 py-12 dark:border-stroke-soft-100/40">
			<Icon name="alert-circle" className="h-8 w-8 text-error-base" />
			<p className="text-center text-sm text-text-sub-600">{message}</p>
			<button
				type="button"
				onClick={onRetry}
				className="font-medium text-sm text-text-strong-950 underline-offset-2 hover:underline"
			>
				Try again
			</button>
		</div>
	);
}
