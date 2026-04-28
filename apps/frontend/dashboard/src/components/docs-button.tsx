"use client";

import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { KbdKeyOutline } from "@reloop/ui/kbd-key-outline";
import { useHotkeys } from "react-hotkeys-hook";

interface DocsButtonProps
	extends React.ComponentPropsWithoutRef<typeof Button.Root> {
	slug?: string;
	url?: string;
}

export const DocsButton = ({
	slug,
	url,
	variant = "neutral",
	mode = "stroke",
	size = "xsmall",
	className,
	...rest
}: DocsButtonProps) => {
	const finalUrl =
		url || (slug ? `https://reloop.sh/docs/${slug}` : "https://reloop.sh/docs");

	const openDocs = () => window.open(finalUrl, "_blank");

	useHotkeys("d", openDocs);

	return (
		<Button.Root
			variant={variant}
			mode={mode}
			size={size}
			onClick={openDocs}
			className={cn("gap-1.5", className)}
			{...rest}
		>
			<Icon name="file-text" className="h-4 w-4" />
			Docs
			<KbdKeyOutline>D</KbdKeyOutline>
		</Button.Root>
	);
};
