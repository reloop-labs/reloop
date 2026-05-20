import { Link, Section, Text } from "react-email";

interface FooterProps {
	baseUrl?: string;
	theme?: "light" | "dark";
}

export const Footer = ({ baseUrl = "https://reloop.sh" }: FooterProps) => {
	return (
		<Section className="text-[#707070]">
			<Text className="m-0 text-[12px] leading-[24px]">
				If you'd like to report an issue, reach out to{" "}
				<Link
					href="https://reloop.sh/help"
					className="text-[#707070] underline"
				>
					Reloop Help
				</Link>
				.
			</Text>
			<Text className="m-0 text-[12px] leading-[24px]">
				<Link
					href={`${baseUrl}/settings/notifications`}
					className="text-[#707070] underline"
				>
					Manage your notification settings
				</Link>
			</Text>

			<Text className="m-0 mt-4 text-[12px] leading-[24px]">
				Copyright © 2026 Reloop Inc. All rights reserved.
				<br />
				440 N Barranca Ave #4133 Covina, CA 91723
			</Text>
		</Section>
	);
};

export default Footer;
