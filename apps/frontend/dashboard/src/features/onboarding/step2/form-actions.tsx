import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import { KbdKeyOutline } from "@reloop/ui/kbd-key-outline";
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
				mode="stroke"
				size="xsmall"
				onClick={onSkip}
				disabled={isLoading}
			>
				Skip
				<span className="inline-flex items-center gap-0.5">
					<KbdKeyOutline>⌥</KbdKeyOutline>
					<KbdKeyOutline>S</KbdKeyOutline>
				</span>
			</Button.Root>
			<Button.Root
				type="submit"
				variant="neutral"
				mode="filled"
				size="xsmall"
				disabled={isLoading}
			>
				{isLoading ? (
					<>
						<Spinner color="currentColor" />
						Adding Domain...
					</>
				) : (
					<>
						Add Domain
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
