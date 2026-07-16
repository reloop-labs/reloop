import * as Button from "@reloop/ui/button";
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
					{/* Delete flow not ported yet — chrome matches Next dashboard. */}
					<Button.Root variant="error" size="xsmall" type="button" disabled>
						<Icon name="trash-2" className="-mr-1 size-3 text-white" />
						Delete Account
					</Button.Root>
				</div>
			</div>
		</div>
	);
}
