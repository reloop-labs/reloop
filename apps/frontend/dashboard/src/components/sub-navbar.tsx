"use client";
import * as TabMenuHorizontal from "@reloop/ui/components/tab-menu-horizontal";
import { usePathname, useRouter } from "next/navigation";

const items = [
	{
		label: "Overview",
		path: "/",
	},
	{
		label: "Domain",
		path: "/domain",
	},
	{
		label: "Settings",
		path: "/settings",
	},
];

export const SubNavbar = () => {
	const pathname = usePathname();
	console.log("🚀 ~ SubNavbar ~ pathname:", pathname);
	const { push } = useRouter();

	return (
		<TabMenuHorizontal.Root defaultValue={"/"} value={pathname || "/"}>
			<TabMenuHorizontal.List className="h-10 gap-0 border-b! px-4 py-0">
				{items.map(({ label, path }) => (
					<TabMenuHorizontal.Trigger
						className="cursor-pointer px-2.5 py-0! text-sm"
						key={path}
						value={path}
						onClick={() => push(path)}
					>
						{label}
					</TabMenuHorizontal.Trigger>
				))}
			</TabMenuHorizontal.List>
		</TabMenuHorizontal.Root>
	);
};
