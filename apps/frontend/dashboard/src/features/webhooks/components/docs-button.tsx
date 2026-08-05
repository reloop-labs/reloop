import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { KbdKeyOutline } from "@reloop/ui/kbd-key-outline";
import { useHotkeys } from "react-hotkeys-hook";

const openDocs = () =>
	window.open("https://reloop.sh/docs/webhooks", "_blank");

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
			<KbdKeyOutline>D</KbdKeyOutline>
		</Button.Root>
	);
};
