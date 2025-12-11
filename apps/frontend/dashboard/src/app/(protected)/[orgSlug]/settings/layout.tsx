"use client";
import { Icon } from "@reloop/ui/icon";
import { SettingsTabs } from "./components/tabs";

const Layout = ({ children }: { children: React.ReactNode }) => {
	return (
		<div>
			<div className="sticky top-0 z-10 flex h-12 items-center justify-start gap-2 border-stroke-soft-100 border-b bg-bg-white-0 px-2">
				<Icon name="gear" className="h-4 w-4" />
				<p className="font-medium text-sm">Settings</p>
			</div>
			<div className="mx-auto max-w-3xl pt-16 px-6">
				<div className="pb-6">
					<p className="font-medium text-2xl">Settings</p>
					<p className="text-paragraph-sm text-text-sub-600">
						Change the settings for your current workspace
					</p>
				</div>
				<SettingsTabs />
				<div className="w-full flex-1 pb-10">{children}</div>
			</div>
		</div>
	);
};

export default Layout;
