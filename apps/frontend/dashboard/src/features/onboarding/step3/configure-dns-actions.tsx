import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import { KbdKeyOutline } from "@reloop/ui/kbd-key-outline";
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
				mode="stroke"
				size="xsmall"
				onClick={onSkip}
				className="gap-1.5"
			>
				Skip
				<span className="inline-flex items-center gap-0.5">
					<KbdKeyOutline>⌥</KbdKeyOutline>
					<KbdKeyOutline>S</KbdKeyOutline>
				</span>
			</Button.Root>
			<Button.Root
				onClick={onVerify}
				size="xsmall"
				variant="neutral"
				disabled={isVerifying}
			>
				{isVerifying ? (
					<>
						<Spinner color="currentColor" />
						Verifying...
					</>
				) : (
					<>
						Verify DNS Records
						<span className="inline-flex items-center gap-0.5">
							<Icon
								name="command"
								className="h-4 w-4 rounded-sm border border-stroke-soft-100/20 p-px"
							/>
							<Icon
								name="enter"
								className="h-4 w-4 rounded-sm border border-stroke-soft-100/20 p-px"
							/>
						</span>
					</>
				)}
			</Button.Root>
		</div>
	);
}
