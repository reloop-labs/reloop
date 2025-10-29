"use client";
import { Icon } from "@reloop/ui/icon";
import { SettingsTabs } from "./components/tabs";

const Layout = ({ children }: { children: React.ReactNode }) => {
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
