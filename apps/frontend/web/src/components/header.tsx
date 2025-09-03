import * as Button from "@reloop/ui/components/button";
import { Logo } from "@reloop/ui/components/logo";
import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";

export const Header = () => {
	return (
		<div className="sticky top-0 z-[1] border-stroke-soft-100 border-b bg-bg-white-0">
			<header className="relative mx-auto flex h-16 w-full max-w-7xl flex-1 items-center justify-between gap-4 px-4 lg:p-[18px]">
				<div className="flex items-center">
					<Link href="/">
						<Logo className="h-8 w-8 rounded-full lg:h-10 lg:w-10" />
					</Link>
				</div>
				<div className="flex items-center gap-2">
					<Link
						href="/login"
						className={Button.buttonVariants({
							variant: "neutral",
							mode: "stroke",
							size: "xsmall",
						}).root()}
					>
						Login
					</Link>
					<Link
						href="/login"
						className={Button.buttonVariants({
							variant: "neutral",

							size: "xsmall",
						}).root()}
					>
						Get Started
					</Link>
					<ThemeToggle />
				</div>
			</header>
		</div>
	);
};
