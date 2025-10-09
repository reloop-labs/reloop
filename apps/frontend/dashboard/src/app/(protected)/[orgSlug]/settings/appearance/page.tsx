"use client";

import { LayoutToggleButton } from "@dashboard/components/layout/layout-toggle-button";
import { ThemeToggle } from "@dashboard/components/theme-toggle";

const AppearancePage = () => {
	return (
		<div className="w-full flex-1 px-10 pt-5 pb-10">
			<div className="border-stroke-soft-100 border-b pt-5 pb-7">
				<p className="font-medium text-2xl text-text-strong-950">Appearance</p>
				<p className="text-paragraph-sm text-text-sub-600">
					Customize how the application looks and feels.
				</p>
			</div>

			<div className="w-full space-y-8 pt-10">
				{/* Theme Selection */}
				<div>
					<div className="mb-6">
						<p className="font-medium text-label-md text-text-strong-950">
							Theme
						</p>
						<p className="text-paragraph-sm text-text-sub-600">
							Choose your preferred color scheme for the application.
						</p>
					</div>
					<ThemeToggle />
				</div>
			</div>
			<div className="w-full space-y-8 pt-10">
				{/* Theme Selection */}
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
