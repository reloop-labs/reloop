"use client";

import { ThemeToggleAppearance } from "./theme-toggle";

const AppearancePage = () => {
	return (
		<div className="w-full space-y-6 pt-4">
			{/* Theme Section */}
			<div>
				<div className="mb-6">
					<p className="font-medium text-label-md text-text-strong-950">
						Theme
					</p>
					<p className="text-paragraph-sm text-text-sub-600">
						Select a base theme for your interface
					</p>
				</div>
				<ThemeToggleAppearance />
			</div>
		</div>
	);
};

export default AppearancePage;
