"use client";

import { motion, type Transition } from "framer-motion";
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

	// Animation variants for staggered children
	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.05,
				delayChildren: 0.1,
			},
		},
	};

	const sidebarItemVariants = {
		hidden: { opacity: 0, x: -8, scaleX: 0 },
		visible: {
			opacity: 1,
			x: 0,
			scaleX: 1,
			transition: {
				type: "spring" as const,
				stiffness: 300,
				damping: 20,
			},
		},
	};

	const contentRowVariants = {
		hidden: { opacity: 0, x: 8, scaleX: 0 },
		visible: {
			opacity: 1,
			x: 0,
			scaleX: 1,
			transition: {
				type: "spring" as const,
				stiffness: 300,
				damping: 20,
			},
		},
	};

	const colorTransition = { duration: 0.3, ease: "easeInOut" as const };

	return (
		<motion.svg
			width="120"
			height="80"
			viewBox="0 0 120 80"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			variants={containerVariants}
			initial="hidden"
			animate="visible"
		>
			{/* Main container */}
			<motion.rect
				x="4"
				y="4"
				width="112"
				height="72"
				rx="4"
				animate={{
					fill: currentColors.container,
					stroke: currentColors.containerStroke,
				}}
				transition={colorTransition}
				strokeWidth="1"
			/>

			{/* Sidebar */}
			<motion.rect
				x="8"
				y="8"
				width="32"
				height="64"
				rx="2"
				animate={{ fill: currentColors.sidebarBg }}
				transition={colorTransition}
			/>

			{/* Sidebar items */}
			<motion.rect
				x="12"
				y="12"
				width="20"
				height="3"
				rx="1.5"
				variants={sidebarItemVariants}
				animate={{ fill: currentColors.sidebarItem }}
				transition={colorTransition}
				style={{ originX: 0 }}
			/>
			<motion.rect
				x="12"
				y="18"
				width="16"
				height="2"
				rx="1"
				variants={sidebarItemVariants}
				animate={{ fill: currentColors.sidebarItem }}
				transition={colorTransition}
				style={{ originX: 0 }}
			/>
			<motion.rect
				x="12"
				y="22"
				width="18"
				height="2"
				rx="1"
				variants={sidebarItemVariants}
				animate={{ fill: currentColors.sidebarItem }}
				transition={colorTransition}
				style={{ originX: 0 }}
			/>
			<motion.rect
				x="12"
				y="26"
				width="14"
				height="2"
				rx="1"
				variants={sidebarItemVariants}
				animate={{ fill: currentColors.sidebarItem }}
				transition={colorTransition}
				style={{ originX: 0 }}
			/>
			<motion.rect
				x="12"
				y="30"
				width="17"
				height="2"
				rx="1"
				variants={sidebarItemVariants}
				animate={{ fill: currentColors.sidebarItem }}
				transition={colorTransition}
				style={{ originX: 0 }}
			/>
			<motion.rect
				x="12"
				y="34"
				width="12"
				height="2"
				rx="1"
				variants={sidebarItemVariants}
				animate={{ fill: currentColors.sidebarItem }}
				transition={colorTransition}
				style={{ originX: 0 }}
			/>

			{/* Content area */}
			<motion.rect
				x="44"
				y="8"
				width="68"
				height="64"
				rx="2"
				animate={{ fill: currentColors.contentBg }}
				transition={colorTransition}
			/>

			{/* Content header */}
			<motion.rect
				x="48"
				y="12"
				width="60"
				height="4"
				rx="2"
				variants={contentRowVariants}
				animate={{ fill: currentColors.contentHeader }}
				transition={colorTransition}
				style={{ originX: 0 }}
			/>
			<motion.rect
				x="50"
				y="13"
				width="12"
				height="2"
				rx="1"
				variants={contentRowVariants}
				animate={{ fill: currentColors.contentAccent }}
				transition={colorTransition}
				style={{ originX: 0 }}
			/>

			{/* Content rows */}
			<motion.rect
				x="48"
				y="20"
				width="60"
				height="3"
				rx="1.5"
				variants={contentRowVariants}
				animate={{ fill: currentColors.contentRow }}
				transition={colorTransition}
				style={{ originX: 0 }}
			/>
			<motion.rect
				x="48"
				y="26"
				width="60"
				height="3"
				rx="1.5"
				variants={contentRowVariants}
				animate={{ fill: currentColors.contentRow }}
				transition={colorTransition}
				style={{ originX: 0 }}
			/>
			<motion.rect
				x="48"
				y="32"
				width="60"
				height="3"
				rx="1.5"
				variants={contentRowVariants}
				animate={{ fill: currentColors.contentRow }}
				transition={colorTransition}
				style={{ originX: 0 }}
			/>
			<motion.rect
				x="48"
				y="38"
				width="60"
				height="3"
				rx="1.5"
				variants={contentRowVariants}
				animate={{ fill: currentColors.contentRow }}
				transition={colorTransition}
				style={{ originX: 0 }}
			/>

			{/* Row content indicators */}
			<motion.rect
				x="50"
				y="21"
				width="16"
				height="1.5"
				rx="0.75"
				variants={contentRowVariants}
				animate={{ fill: currentColors.contentAccent }}
				transition={colorTransition}
				style={{ originX: 0 }}
			/>
			<motion.rect
				x="50"
				y="27"
				width="20"
				height="1.5"
				rx="0.75"
				variants={contentRowVariants}
				animate={{ fill: currentColors.contentAccent }}
				transition={colorTransition}
				style={{ originX: 0 }}
			/>
			<motion.rect
				x="50"
				y="33"
				width="18"
				height="1.5"
				rx="0.75"
				variants={contentRowVariants}
				animate={{ fill: currentColors.contentAccent }}
				transition={colorTransition}
				style={{ originX: 0 }}
			/>
			<motion.rect
				x="50"
				y="39"
				width="14"
				height="1.5"
				rx="0.75"
				variants={contentRowVariants}
				animate={{ fill: currentColors.contentAccent }}
				transition={colorTransition}
				style={{ originX: 0 }}
			/>
		</motion.svg>
	);
};
