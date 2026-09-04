import { CopyCodeBlock } from "#/features/onboarding/step4/copy-code-block";

export function SuccessStep({ secret }: { secret: string }) {
	return (
		<div className="space-y-4">
			<CopyCodeBlock
				code={secret}
				lang="bash"
				copyValue={secret}
				label="secret key"
				minHeight="auto"
			/>
			<div className="rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-amber-800 text-xs leading-relaxed dark:border-amber-800/40 dark:bg-amber-950/30 dark:text-amber-200">
				<span className="font-semibold">Important:</span> Copy and save your secret key now — you won&apos;t be able
				to see it again.
			</div>
		</div>
	);
}
