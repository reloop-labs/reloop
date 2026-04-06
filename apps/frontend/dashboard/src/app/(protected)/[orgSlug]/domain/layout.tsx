"use client";
import { DomainApiDetails } from "@fe/dashboard/components/api-details/domain";

import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Kbd from "@reloop/ui/kbd";
import { useHotkeys } from "react-hotkeys-hook";

const openDocs = () => window.open("https://reloop.sh/docs/domain", "_blank");

const DomainLayout = ({ children }: { children: React.ReactNode }) => {
	useHotkeys("d", openDocs);

	return (
		<div className="mx-auto max-w-3xl sm:px-8">
			<div className="flex items-center justify-between pt-10 pb-6">
				<h1 className="font-medium text-2xl">Domain</h1>
				<div className="flex items-center gap-2 self-end">
					<DomainApiDetails />
					<Button.Root
						variant="neutral"
						mode="stroke"
						size="xsmall"
						onClick={openDocs}
						className="gap-1.5"
					>
						<Icon name="book-closed" className="h-4 w-4" />
						Docs
						<Kbd.Root className="bg-bg-weak-50 text-[10px]">D</Kbd.Root>
					</Button.Root>
				</div>
			</div>
			<div>{children}</div>
		</div>
	);
};

export default DomainLayout;
