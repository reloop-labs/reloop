"use client";
import { Icon } from "@reloop/ui/icon";
import * as Button from "@reloop/ui/button";
import * as Kbd from "@reloop/ui/kbd";
import { useHotkeys } from "react-hotkeys-hook";
import { FeedbackPopover } from "@fe/dashboard/components/feedback-popover";
import Link from "next/link";
import { useParams } from "next/navigation";

const openDocs = () => window.open("https://reloop.sh/docs/learn/api-keys", "_blank");

const ApiKeysLayout = ({ children }: { children: React.ReactNode }) => {
	const { orgSlug } = useParams();
	useHotkeys("d", openDocs);

	return (
		<div>
			<div className="sticky top-0 z-10 flex h-12 items-center justify-start gap-2 border-stroke-soft-100 border-b bg-bg-white-0 px-2">
				<div className="flex justify-between w-full items-center">
					<Link
						href={`/${orgSlug}/api-keys`}
						className={Button.buttonVariants({ variant: "neutral", mode: "ghost", size: "xxsmall" }).root()}
					>
						<Icon name="key-new" className="h-4 w-4" />
						<span className="font-medium text-sm">API Keys</span>
					</Link>
					<div className="flex justify-end items-center">
						<FeedbackPopover />
						<Button.Root
							variant="neutral"
							mode="ghost"
							size="xxsmall"
							onClick={openDocs}
							className="gap-1.5"
						>
							<Icon name="book-closed" className="h-4 w-4" />
							Docs
							<Kbd.Root className="bg-bg-weak-50 text-[10px]">D</Kbd.Root>
						</Button.Root>
					</div>
				</div>
			</div>
			<div>
				<div>{children}</div>
			</div>
		</div>
	);
};

export default ApiKeysLayout;
