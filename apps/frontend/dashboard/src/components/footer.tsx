import { Logo } from "@reloop/ui/logo";
import { ThemeToggle } from "./theme-toggle";

const links = [
	{
		label: "Home",
		href: "/",
	},
];

export const Footer = () => {
	return (
		<div className="border-stroke-soft-200 border-t px-4 py-2">
			<div className="mx-auto flex max-w-7xl items-center justify-between">
				<div className="flex flex-1 items-center gap-2">
					<Logo className="h-10 w-10" />
					{links.map((link) => (
						<a href={link.href} key={link.label}>
							<p className="text-faded-dark text-sm">{link.label}</p>
						</a>
					))}
				</div>
				<div className="flex items-center gap-2">
					<p className="text-sm">All system Normal</p>
					<ThemeToggle />
				</div>
			</div>
		</div>
	);
};
