import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";

export function WorkspaceDangerZone() {
	return (
		<>
			<p className="font-medium text-label-md text-text-strong-950">
				Danger zone
			</p>
			<div className="rounded-xl border border-error-light py-2 pr-2.5 pl-3">
				<div className="flex items-center justify-between gap-4">
					<div>
						<p className="font-medium text-label-sm text-text-strong-950">
							Delete workspace
						</p>
						<p className="text-paragraph-xs text-text-sub-600">
							Delete your workspace and all of its data. This action is
							irreversible.
						</p>
					</div>
					{/* Delete flow not ported yet — keep error styling. */}
					<FancyButton.Root variant="destructive" size="xsmall" type="button">
						<FancyButton.Icon as={Icon} name="trash-2" />
						Delete workspace
					</FancyButton.Root>
				</div>
			</div>
		</>
	);
}
