"use client";

import { ThemeToggleAppearance } from "./theme-toggle";

const AppearancePage = () => {
	return (
		<div className="w-full space-y-8 pt-5">
			{/* Theme Section */}
			<div>
				<div className="mb-6">
					<p className="font-medium text-label-md text-text-strong-950">
						Theme
					</p>
					<p className="text-paragraph-sm text-text-sub-600">
						Select a theme to personalize your platform's appearance
					</p>
				</div>
				<ThemeToggleAppearance />
			</div>
		</div>
	);
};

export default AppearancePage;

