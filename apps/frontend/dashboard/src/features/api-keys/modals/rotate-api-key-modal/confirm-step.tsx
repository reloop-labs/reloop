export function ConfirmStep({
	displayName,
	keyPrefix,
}: {
	displayName: string;
	keyPrefix: string;
}) {
	return (
		<div>
			{/* Key Details Card */}
			<div className="mt-5 space-y-3 rounded-xl border border-stroke-soft-100 bg-bg-weak-50/50 p-4 dark:border-stroke-soft-100/40">
				<div>
					<p className="font-normal text-text-sub-600 text-xs">
						API key name
					</p>
					<p className="mt-0.5 truncate font-medium text-sm text-text-strong-950">
						{displayName}
					</p>
				</div>
				<div>
					<p className="font-normal text-text-sub-600 text-xs">
						API key prefix
					</p>
					<div className="mt-1 flex items-center">
						<span className="font-medium font-mono text-sm">
							{keyPrefix}
						</span>
					</div>
				</div>
			</div>

			{/* Warning Banner */}
			<div className="mt-4 rounded-xl border border-[#FBE3B5] bg-[#FEF6E6] p-4 text-[#8A5300] text-xs leading-relaxed dark:border-amber-800/40 dark:bg-amber-950/30 dark:text-amber-200">
				All existing replicas will need to be updated with the new token.
				Replicas using the old token will lose connectivity.
			</div>
		</div>
	);
}
