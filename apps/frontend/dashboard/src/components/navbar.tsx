import * as Avatar from "@reloop/ui/components/avatar";
import { Logo } from "@reloop/ui/components/logo";
import { SubNavbar } from "./sub-navbar";

export const Navbar = () => {
	return (
		<div>
			<div className="flex items-center justify-between px-3">
				<Logo className="h-8 w-8 rounded-full lg:h-10 lg:w-10" />
				<div className="flex items-center gap-2">
					<Avatar.Root color="purple" size="24" placeholderType="company" />
				</div>
			</div>
			<div>
				<SubNavbar />
			</div>
		</div>
	);
};
