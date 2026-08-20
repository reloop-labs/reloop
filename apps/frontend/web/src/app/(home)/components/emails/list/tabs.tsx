"use client";

import { Icon } from "@reloop/ui/icon";
import * as TabMenuHorizontal from "@reloop/ui/tab-menu-horizontal";
import { AnimateIn } from "../_shared/animate-in";

export function EmailsListTabs({ mounted }: { mounted: boolean }) {
	return (
		<AnimateIn mounted={mounted} delay={0.12} y={10}>
			<TabMenuHorizontal.Root value="sent">
				<TabMenuHorizontal.List className="relative h-11 gap-0 border-b! py-0">
					<TabMenuHorizontal.Trigger
						value="sent"
						tabIndex={-1}
						className="flex cursor-pointer items-center gap-2 px-3 py-0! font-medium text-sm text-text-strong-950"
					>
						<Icon name="mail-send" className="h-4 w-4" />
						Sent
					</TabMenuHorizontal.Trigger>
					<TabMenuHorizontal.Trigger
						value="received"
						tabIndex={-1}
						className="flex cursor-pointer items-center gap-2 px-3 py-0! font-medium text-sm"
					>
						<Icon name="mail-receive" className="h-4 w-4" />
						Received
					</TabMenuHorizontal.Trigger>
				</TabMenuHorizontal.List>
			</TabMenuHorizontal.Root>
		</AnimateIn>
	);
}
