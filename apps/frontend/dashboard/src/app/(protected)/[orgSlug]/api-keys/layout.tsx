"use client";
import { FeedbackPopover } from "@fe/dashboard/components/feedback-popover";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Kbd from "@reloop/ui/kbd";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useHotkeys } from "react-hotkeys-hook";

const openDocs = () =>
	window.open("https://reloop.sh/docs/learn/api-keys", "_blank");

const ApiKeysLayout = ({ children }: { children: React.ReactNode }) => {
	const { orgSlug } = useParams();
	useHotkeys("d", openDocs);

	return (
		<div>
			<div className="sticky top-0 z-10 flex h-12 items-center justify-start gap-2 border-stroke-soft-100 border-b bg-bg-white-0 px-2">
				<div className="flex w-full items-center justify-between">
					<Link
						href={`/${orgSlug}/api-keys`}
						className={Button.buttonVariants({
							variant: "neutral",
							mode: "ghost",
							size: "xxsmall",
						}).root()}
					>
						<Icon name="key-new" className="h-4 w-4" />
						<span className="font-medium text-sm">API Keys</span>
					</Link>
					<FeedbackPopover />
				</div>
			</div>
			<div>
				<div>{children}</div>
			</div>
		</div>
	);
};

export default ApiKeysLayout;
