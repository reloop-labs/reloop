import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import type { EmailEvent } from "../types";

export const FailedStep = ({
	event,
	failedAt,
	errorMessage,
}: {
	event?: EmailEvent | null;
	failedAt?: string | null;
	errorMessage?: string | null;
}) => {
	const timestamp = event?.createdAt || failedAt;

	return (
		<div className="group relative flex flex-col items-center">
			{/* Icon Node */}
			<div className="relative z-10 flex flex-col items-center gap-2">
				<div
					className={cn(
						"flex h-10 w-10 items-center justify-center rounded-[10px] border transition-all duration-300",
						"border-error-soft-200 bg-error-alpha-10 text-error-base",
					)}
				>
					<Icon name="cross-circle" className="h-5 w-5" />
				</div>

				<div className="flex flex-col items-center text-center">
					<span
						className={cn(
							"rounded-md border border-error-soft-200/50 bg-error-alpha-10 px-2 py-1 font-semibold text-error-base text-xs",
						)}
					>
						Failed
					</span>
					{timestamp && (
						<span className="mt-1 font-medium text-text-soft-400 text-xs">
							{new Date(timestamp).toLocaleString([], {
								month: "short",
								day: "numeric",
								hour: "numeric",
								minute: "2-digit",
								hour12: true,
							})}
						</span>
					)}
				</div>
			</div>
		</div>
	);
};
