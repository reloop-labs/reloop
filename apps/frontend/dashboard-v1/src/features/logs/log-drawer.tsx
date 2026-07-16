import * as Drawer from "@reloop/ui/drawer";
import { Icon } from "@reloop/ui/icon";
import { Link } from "@tanstack/react-router";
import { LogDetailPanel } from "./log-detail-panel";

export function LogDrawer({
	logId,
	isOpen,
	onOpenChange,
}: {
	logId: string | null;
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	return (
		<Drawer.Root open={isOpen} onOpenChange={onOpenChange}>
			<Drawer.Content className="max-w-[480px]">
				<Drawer.Header className="border-stroke-soft-200 border-b">
					<div className="flex flex-1 flex-col gap-1">
						<Drawer.Title>Log Details</Drawer.Title>
					</div>
					{logId && (
						<Link
							to="/logs/$logId"
							params={{ logId }}
							className="flex items-center gap-1 text-text-sub-600 text-xs hover:text-text-strong-950"
						>
							<Icon name="arrows-expand-diagonal" className="h-3.5 w-3.5" />
							View full
						</Link>
					)}
				</Drawer.Header>

				<Drawer.Body className="overflow-y-auto p-0">
					{logId && isOpen && <LogDetailPanel logId={logId} />}
				</Drawer.Body>
			</Drawer.Content>
		</Drawer.Root>
	);
}
