import * as Button from "@reloop/ui/components/button";
import { Icon } from "@reloop/ui/components/icon";
import Link from "next/link";

const list = [
	{
		title: "Genera",
		path: "/settings",
		iconName: "settings",
	},
	{
		title: "Members",
		path: "/settings",
		iconName: "members",
	},
	{
		title: "Genera",
		path: "/settings",
		iconName: "settings",
	},
	{
		title: "Genera",
		path: "/settings",
		iconName: "settings",
	},
	{
		title: "Genera",
		path: "/settings",
		iconName: "settings",
	},
];

export const SizeBar = () => {
	return (
		<div className="flex w-64 flex-col gap-2">
			{list.map(({ path, title, iconName }) => (
				<Link
					href={path}
					className={Button.buttonVariants({
						mode: "ghost",
						variant: "neutral",
					}).root({ className: "h-12" })}
				>
					<Icon name={iconName} />
					<span>{title}</span>
				</Link>
			))}
		</div>
	);
};
