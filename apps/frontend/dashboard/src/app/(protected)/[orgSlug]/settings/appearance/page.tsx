"use client";

import { Icon } from "@reloop/ui/icon";
import { ThemeToggleAppearance } from "./theme-toggle";

const AppearancePage = () => {
	return (
		<div>
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
			{/* Layout switching removed */}
		</div>
	);
};

export default AppearancePage;
