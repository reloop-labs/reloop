import * as Button from "@reloop/ui/button";
import * as FancyButton from "@reloop/ui/fancy-button";
import Spinner from "@reloop/ui/spinner";

export function ConfigureDnsActions({
	isVerifying,
	onSkip,
	onVerify,
}: {
	isVerifying: boolean;
	onSkip: () => void;
	onVerify: () => void;
}) {
	return (
		<div className="mt-8 flex items-center justify-end gap-3">
			<Button.Root
				variant="neutral"
				mode="ghost"
				size="small"
				onClick={onSkip}
				className="gap-1.5 rounded-xl"
			>
				Skip
			</Button.Root>
			<FancyButton.Root
				onClick={onVerify}
				size="small"
				variant="blue"
				className="rounded-xl"
				disabled={isVerifying}
			>
				{isVerifying ? (
					<>
						<Spinner color="currentColor" />
						Verifying...
					</>
				) : (
					"Verify DNS Records"
				)}
			</FancyButton.Root>
		</div>
	);
}
