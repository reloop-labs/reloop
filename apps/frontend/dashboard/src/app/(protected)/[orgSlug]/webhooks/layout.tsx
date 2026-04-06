"use client";

import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import { usePathname } from "next/navigation";
import { useQueryState } from "nuqs";
import { useHotkeys } from "react-hotkeys-hook";

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
		<div className="mx-auto max-w-4xl sm:px-8">
			{!isDetailPage && (
				<div className="flex items-center justify-between pt-10 pb-6">
					<div>
						<h1 className="font-medium text-2xl">Webhooks</h1>
						<p className="mt-1 text-sm text-text-sub-600">
							Send real-time event notifications to your endpoints
						</p>
					</div>
					<div className="flex items-center gap-2 self-end">
						<Button.Root
							variant="neutral"
							size="xsmall"
							onClick={() => setModal("create-webhook")}
							className="gap-2"
						>
							<Icon name="plus" className="h-4 w-4" />
							Add webhook
						</Button.Root>
					</div>
				</div>
			)}
			<div>{children}</div>
		</div>
	);
};

export default WebhooksLayout;
