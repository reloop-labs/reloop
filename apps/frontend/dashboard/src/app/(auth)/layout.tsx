import { ThemeToggle } from "@fe/dashboard/components/theme-toggle";

const Layout = ({ children }: { children: React.ReactNode }) => {
	return (
		<div>
			{children}
			<div className="-bottom-11 fixed right-5">
				<ThemeToggle />
			</div>
		</div>
	);
};

export default Layout;
