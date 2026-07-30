import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import type { EmailEvent } from "../types";

export const DeliveredStep = ({
	event,
	onClick,
}: {
	event: EmailEvent | undefined;
	onClick?: () => void;
}) => {
	const isCompleted = !!event;
	const timestamp = event?.createdAt;
	const isInteractive = isCompleted && !!onClick;

	const content = (
		<>
			<div
				className={cn(
					"flex h-10 w-10 items-center justify-center rounded-[10px] border text-text-sub-600 transition-all duration-300",
					isCompleted
						? "border-success-base/20 bg-success-lighter/50 text-success-base"
						: "border-stroke-soft-200 bg-bg-weak-50",
					isInteractive &&
						"group-hover:border-success-base/40 group-hover:shadow-[0_0_0_3px_rgba(34,197,94,0.12)]",
				)}
			>
				<Icon name="check-circle" className="h-5 w-5" />
			</div>

			<div className="flex flex-col items-center text-center">
				<span
					className={cn(
						"rounded-md px-2 py-1 font-semibold text-xs",
						isCompleted
							? "bg-success-lighter text-success-base"
							: "bg-bg-weak-50 text-text-sub-600",
						isInteractive && "group-hover:underline",
					)}
				>
					Delivered
				</span>
				{isCompleted && timestamp && (
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
		</>
	);

	if (isInteractive) {
		return (
			<button
				type="button"
				onClick={onClick}
				className="group relative flex flex-col items-center rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-success-base/40"
				aria-label="View delivered details"
			>
				<div className="relative z-10 flex flex-col items-center gap-2">
					{content}
				</div>
			</button>
		);
	}

	return (
		<div className="group relative flex flex-col items-center">
			<div className="relative z-10 flex flex-col items-center gap-2">
				{content}
			</div>
		</div>
	);
};
