"use client";
import { DomainApiDetails } from "@fe/dashboard/components/api-details/domain";
import { FeedbackPopover } from "@fe/dashboard/components/feedback-popover";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Kbd from "@reloop/ui/kbd";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useHotkeys } from "react-hotkeys-hook";

const openDocs = () => window.open("https://reloop.sh/docs/domain", "_blank");

const DomainLayout = ({ children }: { children: React.ReactNode }) => {
	const { orgSlug } = useParams();
	useHotkeys("d", openDocs);

	return (
		<div>
			<div className="sticky top-0 z-10 flex h-12 items-center justify-start gap-2 border-stroke-soft-100 border-b bg-bg-white-0 pr-2 pl-3">
				<div className="flex w-full items-center justify-between">
					<Link
						href={`/${orgSlug}/domain`}
						className={Button.buttonVariants({
							variant: "neutral",
							mode: "ghost",
							size: "xxsmall",
						}).root()}
					>
						<Icon name="globe" className="h-4 w-4" />
						<span className="font-medium text-sm">Domain</span>
					</Link>
					<div className="flex items-center justify-end">
						<FeedbackPopover />
						<DomainApiDetails />
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

export default DomainLayout;
