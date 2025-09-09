import * as Avatar from "@reloop/ui/avatar";
import { Logo } from "@reloop/ui/logo";
import { OrganizationNavbar } from "./organization-navbar";
import { SubNavbar } from "./sub-navbar";

export const Navbar = () => {
	return (
		<div className="sticky top-0 z-[2] bg-bg-white-0">
			<div className="flex items-center justify-between border-stroke-soft-100 border-b px-3">
				<div className="flex items-center pt-2 pb-1.5">
					<Logo className="h-8 w-8 rounded-full lg:h-10 lg:w-10" />
					<div className="flex items-center gap-2">
						<p className="flex size-5 select-none items-center justify-center text-text-disabled-300">
							/
						</p>
						<div>
							<OrganizationNavbar />
						</div>
					</div>
				</div>
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
