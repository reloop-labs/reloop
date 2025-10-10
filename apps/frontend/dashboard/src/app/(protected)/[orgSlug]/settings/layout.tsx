"use client";
import { useLayout } from "@dashboard/providers/layout-provider";
import { Icon } from "@reloop/ui/icon";
import { SideBar } from "./components/sidebar";
import { SettingsTabs } from "./components/tabs";

const Layout = ({ children }: { children: React.ReactNode }) => {
	const { layoutMode } = useLayout();

	if (layoutMode === "topbar") {
		return (
			<div className="mb-64">
				<div className="border-stroke-soft-100 border-b">
					<div className="mx-auto max-w-5xl">
						<h1 className="py-10 text-title-h3">Settings</h1>
					</div>
				</div>
				<div className="mx-auto flex max-w-5xl">
					<SideBar />
					<div className="w-full flex-1 px-10 pt-5 pb-10">{children}</div>
				</div>
			</div>
		);
	}

	return (
		<div className="mb-64">
			<div className="flex items-center gap-2 border-stroke-soft-100 border-b px-4 py-3.5">
				<Icon name="gear" className="h-4 w-4" />
				<p className="font-medium text-sm">Settings</p>
			</div>
			<div className="mx-auto max-w-3xl pt-16">
				<div className="pb-6">
					<p className="font-medium text-2xl">Settings</p>
					<p className="text-paragraph-sm text-text-sub-600">
						Change the settings for your current workspace
					</p>
				</div>
				<SettingsTabs />
				<div className="w-full flex-1">{children}</div>
			</div>
		</div>
	);
};

export default Layout;
