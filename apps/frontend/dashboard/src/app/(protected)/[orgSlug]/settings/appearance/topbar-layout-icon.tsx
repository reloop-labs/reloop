"use client";

import { useTheme } from "next-themes";

export const TopbarLayoutIcon = ({
	isDark,
	defaultSystemTheme,
}: {
	isDark?: boolean;
	defaultSystemTheme?: boolean;
}) => {
	const { theme, systemTheme } = useTheme();
	const currentTheme = defaultSystemTheme ? systemTheme : theme;
	// Define colors for light and dark themes
	const colors = {
		light: {
			container: "#ffffff",
			containerStroke: "#d1d1d1",
			topbarBg: "#f5f5f5",
			topbarItem: "#d1d1d1",
			contentBg: "#ffffff",
			contentHeader: "#ebebeb",
			contentRow: "#f7f7f7",
			contentAccent: "#7b7b7b",
		},
		dark: {
			container: "#1a1a1a",
			containerStroke: "#404040",
			topbarBg: "#2a2a2a",
			topbarItem: "#404040",
			contentBg: "#1a1a1a",
			contentHeader: "#333333",
			contentRow: "#222222",
			contentAccent: "#666666",
		},
	};

	const currentColors =
		currentTheme === "dark" || isDark ? colors.dark : colors.light;

	return (
		<svg
			width="120"
			height="80"
			viewBox="0 0 120 80"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			{/* Main container */}
			<rect
				x="4"
				y="4"
				width="112"
				height="72"
				rx="4"
				fill={currentColors.container}
				stroke={currentColors.containerStroke}
				strokeWidth="1"
			/>

			{/* Top navigation bar */}
			<rect
				x="8"
				y="8"
				width="104"
				height="12"
				rx="2"
				fill={currentColors.topbarBg}
			/>

			{/* Top nav items */}
			<rect
				x="12"
				y="10"
				width="12"
				height="2"
				rx="1"
				fill={currentColors.topbarItem}
			/>
			<rect
				x="26"
				y="10"
				width="10"
				height="2"
				rx="1"
				fill={currentColors.topbarItem}
			/>
			<rect
				x="38"
				y="10"
				width="14"
				height="2"
				rx="1"
				fill={currentColors.topbarItem}
			/>
			<rect
				x="54"
				y="10"
				width="10"
				height="2"
				rx="1"
				fill={currentColors.topbarItem}
			/>

			{/* Content area */}
			<rect
				x="8"
				y="24"
				width="104"
				height="48"
				rx="2"
				fill={currentColors.contentBg}
			/>

			{/* Content header */}
			<rect
				x="12"
				y="28"
				width="96"
				height="4"
				rx="2"
				fill={currentColors.contentHeader}
			/>
			<rect
				x="14"
				y="29"
				width="16"
				height="2"
				rx="1"
				fill={currentColors.contentAccent}
			/>

			{/* Content rows */}
			<rect
				x="12"
				y="36"
				width="96"
				height="3"
				rx="1.5"
				fill={currentColors.contentRow}
			/>
			<rect
				x="12"
				y="42"
				width="96"
				height="3"
				rx="1.5"
				fill={currentColors.contentRow}
			/>
			<rect
				x="12"
				y="48"
				width="96"
				height="3"
				rx="1.5"
				fill={currentColors.contentRow}
			/>
			<rect
				x="12"
				y="54"
				width="96"
				height="3"
				rx="1.5"
				fill={currentColors.contentRow}
			/>

			{/* Row content indicators */}
			<rect
				x="14"
				y="37"
				width="32"
				height="1.5"
				rx="0.75"
				fill={currentColors.contentAccent}
			/>
			<rect
				x="14"
				y="43"
				width="28"
				height="1.5"
				rx="0.75"
				fill={currentColors.contentAccent}
			/>
			<rect
				x="14"
				y="49"
				width="36"
				height="1.5"
				rx="0.75"
				fill={currentColors.contentAccent}
			/>
			<rect
				x="14"
				y="55"
				width="30"
				height="1.5"
				rx="0.75"
				fill={currentColors.contentAccent}
			/>
		</svg>
	);
};
