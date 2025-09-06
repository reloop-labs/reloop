import { SizeBar } from "./components/sidebar";

const Layout = ({ children }: { children: React.ReactNode }) => {
	return (
		<div className="mb-64 ">
			<div className="border-stroke-soft-100 border-b">
				<div className="mx-auto max-w-5xl">
					<h1 className="py-10 text-title-h3">Settings</h1>
				</div>
			</div>
			<div className="mx-auto flex max-w-5xl">
				<div className="pt-5">
					<SizeBar />
				</div>
				<div className="flex-1">{children}</div>
			</div>
		</div>
	);
};
export default Layout;
