import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import { useEditorStore } from "../../editor/use-editor-store";

export const RightAction = () => {
	const isDirty = useEditorStore((s) => s.isDirty);

	return (
		<div className="border-stroke-soft-100/50 border-b px-4 py-3">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<div className="flex items-center gap-1.5 rounded-full bg-bg-weak-50 px-2.5 py-1">
						<div className={`h-1.5 w-1.5 rounded-full ${isDirty ? 'bg-amber-400' : 'bg-green-400'}`} />
						<span className="font-medium text-[11px] text-text-sub-600">
							{isDirty ? "Unsaved" : "Draft"}
						</span>
					</div>
				</div>
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
	);
};
