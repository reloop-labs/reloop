import { cn } from "@reloop/ui/cn";

interface ConnectionStatusProps {
	status: "connecting" | "connected" | "disconnected" | "error";
	isSynced: boolean;
}

export function ConnectionStatus({ status, isSynced }: ConnectionStatusProps) {
	const config = {
		connecting: {
			dot: "bg-warning-base animate-pulse",
			label: "Connecting...",
			text: "text-warning-base",
		},
		connected: {
			dot: isSynced
				? "bg-success-base"
				: "bg-information-base animate-pulse",
			label: isSynced ? "Live" : "Syncing...",
			text: isSynced ? "text-success-base" : "text-information-base",
		},
		disconnected: {
			dot: "bg-faded-base",
			label: "Offline",
			text: "text-text-sub-600",
		},
		error: {
			dot: "bg-error-base",
			label: "Connection error",
			text: "text-error-base",
		},
	}[status];

	return (
		<div
			className={cn(
				"flex items-center gap-1.5 text-paragraph-xs font-medium",
				config.text,
			)}
		>
			<span className={cn("h-2 w-2 rounded-full", config.dot)} />
			{config.label}
		</div>
	);
}
