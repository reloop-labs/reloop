import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import {
	ActionKbd,
	actionKbdOnSolidClassName,
} from "#/features/dashboard/keyboard-shortcuts-reveal";

const actionKbdOnButtonClassName = actionKbdOnSolidClassName;

export const AgentInboxEmptyState = ({
	onAddClick,
}: {
	onAddClick: () => void;
}) => {
	return (
		<div className="flex flex-col items-center px-6 py-12 text-center dark:bg-bg-weak-50/30">
			<div className="mb-4 flex items-center justify-center">
				<Icon name="inbox" className="h-8 w-8 text-text-sub-600" />
			</div>
			<h3 className="mb-2 font-semibold text-text-strong-950 text-xl">
				Create your first inbox
			</h3>
			<p className="mx-auto mb-6 max-w-75 text-balance font-medium text-[12px] text-text-sub-600">
				Create a dedicated inbox address so inbound mail is easy to find and
				route.
			</p>
			<FancyButton.Root
				type="button"
				variant="neutral"
				size="small"
				onClick={onAddClick}
				className="gap-1.5 rounded-xl"
				aria-keyshortcuts="a"
			>
				<Icon name="plus" className="h-4 w-4" />
				Add address
				<ActionKbd className={actionKbdOnButtonClassName}>A</ActionKbd>
			</FancyButton.Root>
		</div>
	);
};
