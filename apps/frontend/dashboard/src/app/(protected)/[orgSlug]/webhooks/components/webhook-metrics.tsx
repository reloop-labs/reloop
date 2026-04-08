interface WebhookMetricsProps {
	totalEndpoints: number;
	totalDeliveries: number;
	failureRate: string;
}

export const WebhookMetrics = ({
	totalEndpoints,
	totalDeliveries,
	failureRate,
}: WebhookMetricsProps) => {
	return (
		<div className="mb-8 grid grid-cols-3 gap-4">
			<div className="flex flex-col">
				<span className="mb-2 font-semibold text-text-sub-600 text-xs uppercase tracking-wider">
					Total Endpoints
				</span>
				<span className="font-semibold text-2xl text-text-strong-950">
					{totalEndpoints}
				</span>
			</div>
			<div className="flex flex-col">
				<span className="mb-2 font-semibold text-text-sub-600 text-xs uppercase tracking-wider">
					Deliveries (7d)
				</span>
				<span className="font-semibold text-2xl text-text-strong-950">
					{totalDeliveries.toLocaleString()}
				</span>
			</div>
			<div className="flex flex-col">
				<span className="mb-2 font-semibold text-text-sub-600 text-xs uppercase tracking-wider">
					Failure Rate
				</span>
				<span className="font-semibold text-2xl text-[#D49B43]">
					{failureRate}%
				</span>
			</div>
		</div>
	);
};
