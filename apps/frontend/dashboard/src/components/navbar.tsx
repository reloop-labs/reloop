import * as Avatar from "@reloop/ui/components/avatar";
import * as Breadcrumb from "@reloop/ui/components/breadcrumb";
import { Logo } from "@reloop/ui/components/logo";
import { SubNavbar } from "./sub-navbar";

export const Navbar = () => {
	return (
		<div>
			<div className="flex items-center justify-between px-3">
				<div className="flex items-center gap-2">
					<Logo className="h-8 w-8 rounded-full lg:h-10 lg:w-10" />
					<Breadcrumb.Root>
						<Breadcrumb.Item>Settings</Breadcrumb.Item>
						<Breadcrumb.ArrowIcon>/</Breadcrumb.ArrowIcon>
						<Breadcrumb.Item>Notifications</Breadcrumb.Item>
						<Breadcrumb.ArrowIcon>/</Breadcrumb.ArrowIcon>
						<Breadcrumb.Item active>Email Notifications</Breadcrumb.Item>
					</Breadcrumb.Root>
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
