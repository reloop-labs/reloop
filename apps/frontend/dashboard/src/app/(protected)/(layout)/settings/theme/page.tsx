"use client";

import { ThemeToggleAppearance } from "./theme-toggle";

const AppearancePage = () => {
	return (
		<div className="w-full space-y-6 pt-5">
			<div>
				<div className="mb-6">
					<h1 className="font-semibold text-text-strong-950 text-title-h5 dark:text-white">
						Theme
					</h1>
					<p className="mt-1 text-paragraph-sm text-text-sub-600 dark:text-white/60">
						Select a base theme for your interface.
					</p>
				</div>
				<ThemeToggleAppearance />
			</div>
		</div>
	);
};

export default AppearancePage;
