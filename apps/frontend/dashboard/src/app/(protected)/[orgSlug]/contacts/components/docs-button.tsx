"use client";

import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Kbd from "@reloop/ui/kbd";
import { useHotkeys } from "react-hotkeys-hook";

const openDocs = () => window.open("https://reloop.sh/docs/contacts", "_blank");

export const DocsButton = () => {
	useHotkeys("d", openDocs);

	return (
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
	);
};
