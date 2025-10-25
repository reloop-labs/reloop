"use client";

import { LayoutToggleButton } from "@fe/dashboard/app/(protected)/[orgSlug]/settings/appearance/layout-toggle-button";
import { useLayout } from "@fe/dashboard/providers/layout-provider";
import { Icon } from "@reloop/ui/icon";
import { ThemeToggleAppearance } from "./theme-toggle";

const AppearancePage = () => {
	const { layoutMode } = useLayout();
	const isTopbar = layoutMode === "topbar";
	return (
		<div>
			{isTopbar && (
				<div className="border-stroke-soft-100 border-b pt-5 pb-5">
					<div className="flex items-center gap-2">
						<Icon name="swatch-book" className="h-5 w-5" />
						<p className="font-medium text-2xl text-text-strong-950">
							Appearance
						</p>
					</div>
					<p className="text-paragraph-sm text-text-sub-600">
						Customize how the application looks and feels.
					</p>
				</div>
			)}

			<div className="w-full space-y-8 pt-5">
				<div>
					<div className="mb-6">
						<p className="font-medium text-label-md text-text-strong-950">
							Theme
						</p>
						<p className="text-paragraph-sm text-text-sub-600">
							Select a theme to personalize your platform’s appearance
						</p>
					</div>
					<ThemeToggleAppearance />
				</div>
			</div>
			<div className="w-full space-y-8 pt-10">
				<div>
					<div className="mb-6">
						<p className="font-medium text-label-md text-text-strong-950">
							Layout
						</p>
						<p className="text-paragraph-sm text-text-sub-600">
							Choose your preferred layout for the application.
						</p>
					</div>
					<LayoutToggleButton />
				</div>
			</div>
		</div>
	);
};

export default AppearancePage;
