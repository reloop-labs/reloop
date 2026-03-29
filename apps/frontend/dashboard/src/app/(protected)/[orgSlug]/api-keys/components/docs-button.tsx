"use client";

import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as Kbd from "@reloop/ui/kbd";
import { useHotkeys } from "react-hotkeys-hook";

const openDocs = () =>
	window.open("https://reloop.sh/docs/learn/api-keys", "_blank");

type ButtonProps = React.ComponentPropsWithoutRef<typeof Button.Root>;

export const DocsButton = (props: ButtonProps) => {
	useHotkeys("d", openDocs);

	const {
		variant = "neutral",
		mode = "ghost",
		size = "xxsmall",
		className,
		...rest
	} = props;

	return (
		<Button.Root
			variant={variant}
			mode={mode}
			size={size}
			onClick={openDocs}
			className={cn("gap-1.5", className)}
			{...rest}
		>
			<Icon name="book-closed" className="h-4 w-4" />
			Docs
			<Kbd.Root className="bg-bg-weak-50 text-[10px]">D</Kbd.Root>
		</Button.Root>
	);
};
