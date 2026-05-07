"use client";

import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";

export const WorkspaceDangerZone = () => {
	return (
		<>
			<p className="font-medium text-label-md text-text-strong-950">
				Danger zone
			</p>
			<div className="rounded-xl border border-error-light py-2 pr-2.5 pl-3">
				<div className="flex items-center justify-between">
					<div>
						<p className="font-medium text-label-sm text-text-strong-950">
							Delete workspace
						</p>
						<p className="text-paragraph-xs text-text-sub-600">
							Delete your workspace and all of its data. This action is
							irreversible.
						</p>
					</div>
					<Button.Root variant="error" size="xsmall">
						<Icon name="trash-2" className="-mr-1 size-3 text-white" />
						Delete workspace
					</Button.Root>
				</div>
			</div>
		</>
	);
};
