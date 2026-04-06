"use client";

import { WebhooksApiDetails } from "@fe/dashboard/components/api-details/webhooks";

import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import { usePathname } from "next/navigation";
import { useQueryState } from "nuqs";
import { useHotkeys } from "react-hotkeys-hook";
import { DocsButton } from "./components/docs-button";

const WebhooksLayout = ({ children }: { children: React.ReactNode }) => {
	const [, setModal] = useQueryState("modal");
	const pathname = usePathname();

	const isDetailPage = pathname.match(/\/webhooks\/([^/]+)$/) !== null;

	useHotkeys(
		"mod+a",
		(event) => {
			event.preventDefault();
			setModal("create-webhook");
		},
		{
			enabled: !isDetailPage,
		},
	);

	return (
		<div className="mx-auto max-w-3xl sm:px-8">
			{!isDetailPage && (
				<div className="flex items-center justify-between pt-10 pb-6">
					<h1 className="font-medium text-2xl">Webhooks</h1>
					<div className="flex items-center gap-2 self-end">
						<DocsButton size="xsmall" mode="stroke" />
						<Button.Root
							variant="neutral"
							size="xsmall"
							onClick={() => setModal("create-webhook")}
							className="gap-2"
						>
							<Icon name="plus" className="h-4 w-4" />
							Create webhook
							<span className="inline-flex items-center gap-0.5">
								<Icon
									name="command"
									className="h-4 w-4 rounded-sm border border-stroke-soft-100/20 p-px"
								/>
								<span className="flex h-4 w-4 items-center justify-center rounded-sm border border-stroke-soft-100/20 p-px font-medium text-[10px] uppercase">
									A
								</span>
							</span>
						</Button.Root>
						<WebhooksApiDetails size="xsmall" mode="ghost" />
					</div>
				</div>
			)}
			<div>{children}</div>
		</div>
	);
};

export default WebhooksLayout;
