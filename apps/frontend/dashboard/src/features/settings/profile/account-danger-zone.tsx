import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";

export function AccountDangerZone() {
	return (
		<div className="mt-6">
			<p className="mb-3 font-medium text-label-md text-text-strong-950">
				Danger zone
			</p>
			<div className="rounded-xl border border-error-light py-2 pr-2.5 pl-3">
				<div className="flex items-center justify-between gap-4">
					<div>
						<p className="font-medium text-label-sm text-text-strong-950">
							Delete account
						</p>
						<p className="text-paragraph-xs text-text-sub-600">
							Permanently delete your account and all its associated data. This
							cannot be undone.
						</p>
					</div>
					{/* Delete flow not ported yet — keep error styling (disabled greys the button). */}
					<FancyButton.Root variant="destructive" size="xsmall" type="button">
						<FancyButton.Icon as={Icon} name="trash-2" className="h-4 w-h" />
						Delete Account
					</FancyButton.Root>
				</div>
			</div>
		</div>
	);
}
