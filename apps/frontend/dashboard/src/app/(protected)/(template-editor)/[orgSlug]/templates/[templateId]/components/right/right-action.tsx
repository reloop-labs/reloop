import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import { Editbody } from "./edit-body";

export const RightAction = () => {
	return (
		<div>
			<div className="border-stroke-soft-100/50 border-b px-4 py-3">
				<div className="flex items-center justify-between">
					<p className="text-sm text-text-sub-600">Draft</p>
					<div className="flex items-center gap-2">
						<Button.Root variant="neutral" size="xsmall" mode="ghost">
							<Icon name="send-1" className="-rotate-45 h-4 w-4" />
						</Button.Root>
						<Button.Root variant="neutral" size="xsmall">
							Publish
						</Button.Root>
					</div>
				</div>
			</div>
			<Editbody />
		</div>
	);
};
