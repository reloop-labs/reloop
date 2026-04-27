"use client";

import { DomainApiDetails } from "@fe/dashboard/components/api-details/domain";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import { KbdCommand } from "@reloop/ui/kbd-command";
import { KbdKey } from "@reloop/ui/kbd-key";
import { KbdKeyOutline } from "@reloop/ui/kbd-key-outline";
import Link from "next/link";
import { useHotkeys } from "react-hotkeys-hook";

export const DomainListHeader = () => {
	const openDocs = () =>
		window.open("https://reloop.sh/docs/domains", "_blank");

	useHotkeys("d", openDocs);

	return (
		<div className="flex items-center justify-between pt-10 pb-6">
			<h1 className="flex items-center justify-center gap-1 font-medium text-2xl">
				Domains
			</h1>
			<div className="flex items-center gap-2">
				<Button.Root
					variant="neutral"
					mode="stroke"
					size="xsmall"
					onClick={openDocs}
					className="gap-1.5"
				>
					<Icon name="book-closed" className="h-4 w-4" />
					Docs
					<KbdKeyOutline>D</KbdKeyOutline>
				</Button.Root>
				<Link
					className={`${Button.buttonVariants({
						variant: "neutral",
						size: "xsmall",
					}).root()}`}
					href={"/domain/add"}
				>
					<Icon name="plus" className="h-4 w-4" />
					Add domain
					<span className="inline-flex items-center gap-0.5">
						<KbdCommand />
						<KbdKey>a</KbdKey>
					</span>
				</Link>
				<DomainApiDetails />
			</div>
		</div>
	);
};
