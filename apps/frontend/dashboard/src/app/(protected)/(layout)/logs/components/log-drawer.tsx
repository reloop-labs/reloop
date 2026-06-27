"use client";

import * as Drawer from "@reloop/ui/drawer";
import { Icon } from "@reloop/ui/icon";
import Link from "next/link";
import { useGetBackToUrl } from "@fe/dashboard/utils/navigation";
import { LogDetailPanel } from "./log-detail-panel";

interface LogDrawerProps {
	logId: string | null;
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
}

export const LogDrawer = ({ logId, isOpen, onOpenChange }: LogDrawerProps) => {
	const getBackToUrl = useGetBackToUrl();
	return (
		<Drawer.Root open={isOpen} onOpenChange={onOpenChange}>
			<Drawer.Content className="max-w-[480px]">
				<Drawer.Header className="border-stroke-soft-200 border-b">
					<div className="flex flex-1 flex-col gap-1">
						<Drawer.Title>Log Details</Drawer.Title>
					</div>
					{logId && (
						<Link
							href={getBackToUrl(`/logs/${logId}`)}
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
};
