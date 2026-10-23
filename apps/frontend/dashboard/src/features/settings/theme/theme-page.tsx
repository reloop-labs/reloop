import { ThemeToggleAppearance } from "./theme-toggle";

export function ThemePage() {
	return (
		<div className="w-full space-y-6 pt-5">
			<div>
				<div className="mb-6">
					<h1 className="font-semibold text-text-strong-950 text-title-h5 dark:text-white">
						Theme
					</h1>
				</div>
				<ThemeToggleAppearance />
			</div>
		</div>
	);
}
