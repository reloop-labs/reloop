import { Link, Text } from "react-email";

interface SocialLinksProps {
	theme?: "light" | "dark";
}

const socials = [
	{
		name: "X (Twitter)",
		href: "https://x.com/reloop_labs",
		label: "𝕏",
	},
	{
		name: "GitHub",
		href: "https://github.com/reloop-labs",
		label: "GitHub",
	},
	{
		name: "LinkedIn",
		href: "https://www.linkedin.com/company/reloop-labs",
		label: "LinkedIn",
	},
];

export const SocialLinks = ({ theme = "light" }: SocialLinksProps) => {
	const isDark = theme === "dark";
	const linkColor = "#707070";

	return (
		<Text className="m-0 mb-4 text-[12px] leading-[24px]">
			{socials.map((social, i) => (
				<>
					<Link
						key={social.name}
						href={social.href}
						style={{
							color: linkColor,
							textDecoration: "none",
							fontFamily: "monospace",
							fontSize: social.name === "X (Twitter)" ? "18px" : "13px",
							letterSpacing: "0.05em",
						}}
					>
						{social.label}
					</Link>
					{i < socials.length - 1 && (
						<span
							style={{
								color: isDark ? "#333333" : "#d0d0d0",
								margin: "0 8px",
								fontSize: "18px",
							}}
						>
							·
						</span>
					)}
				</>
			))}
		</Text>
	);
};

export default SocialLinks;
