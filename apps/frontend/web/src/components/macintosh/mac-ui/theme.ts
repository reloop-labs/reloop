export function isDarkMode(): boolean {
	if (typeof document === "undefined") return false;
	return document.documentElement.classList.contains("dark");
}

export interface ThemeTokens {
	isDark: boolean;
	desktopBg: string;
	desktopDither: string;
	menuBg: string;
	menuText: string;
	menuBorder: string;
	windowBg: string;
	windowText: string;
	windowBorder: string;
	windowShadow: string;
	headerInfoBg: string;
	headerInfoBorder: string;
	scrollTrack: string;
	scrollThumb: string;
	scrollBorder: string;
	highlightBg: string;
	highlightText: string;
}

export function getThemeTokens(): ThemeTokens {
	const dark = isDarkMode();
	return {
		isDark: dark,
		desktopBg: dark ? "#0a0a0a" : "#A8A8A8",
		desktopDither: dark ? "#1a1a1a" : "#FFFFFF",
		menuBg: dark ? "#141414" : "#FFFFFF",
		menuText: dark ? "#FFFFFF" : "#000000",
		menuBorder: dark ? "#262626" : "#000000",
		windowBg: dark ? "#141414" : "#FFFFFF",
		windowText: dark ? "#FFFFFF" : "#000000",
		windowBorder: dark ? "#FFFFFF" : "#000000",
		windowShadow: "#000000",
		headerInfoBg: dark ? "#1e1e1e" : "#FFFFFF",
		headerInfoBorder: dark ? "#333333" : "#000000",
		scrollTrack: dark ? "#101010" : "#FFFFFF",
		scrollThumb: dark ? "#242424" : "#FFFFFF",
		scrollBorder: dark ? "#FFFFFF" : "#000000",
		highlightBg: dark ? "#FFFFFF" : "#000000",
		highlightText: dark ? "#000000" : "#FFFFFF",
	};
}
