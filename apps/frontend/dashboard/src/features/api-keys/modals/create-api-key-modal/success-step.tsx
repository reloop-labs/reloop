import { CopyCodeBlock } from "#/features/onboarding/step4/copy-code-block";

export function SuccessStep({ secret }: { secret: string }) {
	return (
		<div>
			{/* Key Display Card */}
			<div className="mt-5">
				<CopyCodeBlock
					code={secret}
					lang="bash"
					copyValue={secret}
					label="secret key"
					minHeight="auto"
				/>
			</div>

			{/* Warning Banner */}
			<div className="mt-4 rounded-xl border border-[#FBE3B5] bg-[#FEF6E6] p-4 text-[#8A5300] text-xs leading-relaxed dark:border-amber-800/40 dark:bg-amber-950/30 dark:text-amber-200">
				<span className="font-semibold">Important:</span> Copy and save your secret key
				now. You won&apos;t be able to see it again.
			</div>
		</div>
	);
}
