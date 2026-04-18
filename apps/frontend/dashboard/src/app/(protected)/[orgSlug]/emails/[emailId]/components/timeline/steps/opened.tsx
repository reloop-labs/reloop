import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import type { EmailEvent } from "../types";

export const OpenedStep = ({
	event,
	isLast,
	isNextToComplete,
}: {
	event: EmailEvent | undefined;
	isLast: boolean;
	isNextToComplete: boolean;
}) => {
	const isCompleted = !!event;
	const timestamp = event?.createdAt;

	return (
		<div className="group relative flex flex-1 flex-col items-center">
			{/* Connection Line */}
			{!isLast && (
				<div className="absolute top-5 left-1/2 h-[2px] w-full bg-stroke-soft-100">
					<div
						className="h-full bg-success-base transition-[width] duration-500 ease-in-out"
						style={{ width: isCompleted && !isNextToComplete ? "100%" : "0%" }}
					/>
				</div>
			)}

			{/* Icon Node */}
			<div className="relative z-10 flex flex-col items-center gap-2">
				<div
					className={cn(
						"flex h-10 w-10 items-center justify-center rounded-[10px] border transition-all duration-300",
						isCompleted
							? "scale-100 border-success-base bg-success-alpha-10 text-success-base"
							: "scale-[0.95] border-stroke-soft-200 bg-bg-weak-50 text-text-sub-600",
					)}
				>
					<Icon name="eye-outline" className="h-5 w-5" />
				</div>

				<div className="flex flex-col items-center text-center">
					<span
						className={cn(
							"rounded-md bg-bg-weak-50 px-2 py-1 font-semibold text-xs",
							isCompleted ? "text-text-strong-950" : "text-text-sub-600",
						)}
					>
						Opened
					</span>
					{isCompleted && timestamp && (
						<span className="mt-1 font-medium text-[10px] text-text-soft-400">
							{new Date(timestamp).toLocaleTimeString([], {
								hour: "2-digit",
								minute: "2-digit",
							})}
						</span>
					)}
				</div>
			</div>
		</div>
	);
};
