import * as Button from "@reloop/ui/components/button";
import { Logo } from "@reloop/ui/components/logo";
import { ThemeToggle } from "./theme-toggle";

export const Header = () => {
	return (
		<div className="sticky top-0 z-[1] border-stroke-soft-100 border-b bg-bg-white-0">
			<header className="relative mx-auto flex h-16 w-full max-w-7xl flex-1 items-center justify-between gap-4 px-4 lg:p-[18px]">
				<div className="flex items-center">
					<Logo className="h-8 w-8 rounded-full lg:h-10 lg:w-10" />
				</div>
				<div className="flex items-center gap-2">
					<Button.Root size="xsmall" mode="stroke" variant="neutral">
						Login
					</Button.Root>
					<Button.Root size="xsmall" variant="neutral">
						Get Started
					</Button.Root>
					<ThemeToggle />
				</div>
			</header>
		</div>
	);
};
