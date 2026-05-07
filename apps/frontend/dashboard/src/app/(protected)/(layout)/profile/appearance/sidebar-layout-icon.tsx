"use client";

import { useTheme } from "next-themes";

export type SidebarLayoutIconVariant = "light" | "dark" | "auto";

export const SidebarLayoutIcon = ({
	variant = "auto",
}: {
	variant?: SidebarLayoutIconVariant;
}) => {
	const { systemTheme } = useTheme();

	// Define colors for light and dark themes
	const colors = {
		light: {
			container: "#ffffff",
			containerStroke: "#d1d1d1",
			sidebarBg: "#f5f5f5",
			sidebarItem: "#d1d1d1",
			contentBg: "#ffffff",
			contentHeader: "#ebebeb",
			contentRow: "#f7f7f7",
			contentAccent: "#7b7b7b",
		},
		dark: {
			container: "#1a1a1a",
			containerStroke: "#404040",
			sidebarBg: "#2a2a2a",
			sidebarItem: "#404040",
			contentBg: "#1a1a1a",
			contentHeader: "#333333",
			contentRow: "#222222",
			contentAccent: "#666666",
		},
	};

	// Determine which colors to use based on variant
	const getThemeColors = () => {
		if (variant === "light") return colors.light;
		if (variant === "dark") return colors.dark;
		// For "auto", use system theme
		return systemTheme === "dark" ? colors.dark : colors.light;
	};

	const currentColors = getThemeColors();

	return (
		<svg
			width="120"
			height="80"
			viewBox="0 0 120 80"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			{/* Container wrapper */}
			<rect
				x="0.5"
				y="0.5"
				width="119"
				height="79"
				rx="7.5"
				fill={currentColors.container}
				stroke={currentColors.containerStroke}
			/>

			{/* Sidebar */}
			<rect
				x="8"
				y="8"
				width="32"
				height="64"
				rx="2"
				fill={currentColors.sidebarBg}
			/>

			{/* Sidebar items */}
			<rect
				x="12"
				y="12"
				width="20"
				height="3"
				rx="1.5"
				fill={currentColors.sidebarItem}
			/>
			<rect
				x="12"
				y="18"
				width="16"
				height="2"
				rx="1"
				fill={currentColors.sidebarItem}
			/>
			<rect
				x="12"
				y="22"
				width="18"
				height="2"
				rx="1"
				fill={currentColors.sidebarItem}
			/>
			<rect
				x="12"
				y="26"
				width="14"
				height="2"
				rx="1"
				fill={currentColors.sidebarItem}
			/>
			<rect
				x="12"
				y="30"
				width="17"
				height="2"
				rx="1"
				fill={currentColors.sidebarItem}
			/>
			<rect
				x="12"
				y="34"
				width="12"
				height="2"
				rx="1"
				fill={currentColors.sidebarItem}
			/>

			{/* Content area */}
			<rect
				x="44"
				y="8"
				width="68"
				height="64"
				rx="2"
				fill={currentColors.contentBg}
			/>

			{/* Content header */}
			<rect
				x="48"
				y="12"
				width="60"
				height="4"
				rx="2"
				fill={currentColors.contentHeader}
			/>
			<rect
				x="50"
				y="13"
				width="12"
				height="2"
				rx="1"
				fill={currentColors.contentAccent}
			/>

			{/* Content rows */}
			<rect
				x="48"
				y="20"
				width="60"
				height="3"
				rx="1.5"
				fill={currentColors.contentRow}
			/>
			<rect
				x="48"
				y="26"
				width="60"
				height="3"
				rx="1.5"
				fill={currentColors.contentRow}
			/>
			<rect
				x="48"
				y="32"
				width="60"
				height="3"
				rx="1.5"
				fill={currentColors.contentRow}
			/>
			<rect
				x="48"
				y="38"
				width="60"
				height="3"
				rx="1.5"
				fill={currentColors.contentRow}
			/>

			{/* Row content indicators */}
			<rect
				x="50"
				y="21"
				width="16"
				height="1.5"
				rx="0.75"
				fill={currentColors.contentAccent}
			/>
			<rect
				x="50"
				y="27"
				width="20"
				height="1.5"
				rx="0.75"
				fill={currentColors.contentAccent}
			/>
			<rect
				x="50"
				y="33"
				width="18"
				height="1.5"
				rx="0.75"
				fill={currentColors.contentAccent}
			/>
			<rect
				x="50"
				y="39"
				width="14"
				height="1.5"
				rx="0.75"
				fill={currentColors.contentAccent}
			/>
		</svg>
	);
};
