interface ConnectionStatusProps {
	status: "connecting" | "connected" | "disconnected" | "error";
	isSynced: boolean;
}

export function ConnectionStatus({ status, isSynced }: ConnectionStatusProps) {
	const config = {
		connecting: {
			dot: "bg-yellow-400 animate-pulse",
			label: "Connecting...",
			text: "text-yellow-600",
		},
		connected: {
			dot: isSynced ? "bg-green-500" : "bg-blue-400 animate-pulse",
			label: isSynced ? "Live" : "Syncing...",
			text: isSynced ? "text-green-600" : "text-blue-600",
		},
		disconnected: {
			dot: "bg-gray-400",
			label: "Offline",
			text: "text-gray-500",
		},
		error: {
			dot: "bg-red-500",
			label: "Connection error",
			text: "text-red-600",
		},
	}[status];

	return (
		<div className={`flex items-center gap-1.5 text-xs ${config.text}`}>
			<span className={`h-2 w-2 rounded-full ${config.dot}`} />
			{config.label}
		</div>
	);
}
