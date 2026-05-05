import type * as React from "react";
import { Img, Section } from "react-email";

interface WrapperProps {
	children: React.ReactNode;
	baseUrl?: string;
	theme?: "light" | "dark";
}

export const Wrapper = ({
	children,
	baseUrl = "https://reloop.sh",
	theme = "light",
}: WrapperProps) => {
	const isDark = theme === "dark";

	return (
		<Section className="mx-auto mt-[40px] mb-[40px] max-w-[560px] px-6">
			{/* Logo */}
			<Section className="mb-6">
				<Img
					src={`${baseUrl}/web-app-manifest-192x192.png`}
					width="52"
					height="52"
					alt="Reloop Logo"
					className={isDark ? "invert" : "-ml-2.5"}
				/>
			</Section>
			{children}
		</Section>
	);
};

export default Wrapper;
