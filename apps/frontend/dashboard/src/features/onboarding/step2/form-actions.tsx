import * as Button from "@reloop/ui/button";
import * as FancyButton from "@reloop/ui/fancy-button";
import Spinner from "@reloop/ui/spinner";

export function FormActions({
	isLoading,
	onSkip,
}: {
	isLoading: boolean;
	onSkip: () => void;
}) {
	return (
		<div className="mt-3 flex items-center justify-end gap-3">
			<Button.Root
				type="button"
				variant="neutral"
				mode="ghost"
				size="small"
				className="rounded-xl"
				onClick={onSkip}
				disabled={isLoading}
			>
				Skip
			</Button.Root>
			<FancyButton.Root
				type="submit"
				variant="blue"
				size="small"
				className="rounded-xl"
				disabled={isLoading}
			>
				{isLoading ? (
					<>
						<Spinner color="currentColor" />
						Adding Domain...
					</>
				) : (
					"Add Domain"
				)}
			</FancyButton.Root>
		</div>
	);
}
