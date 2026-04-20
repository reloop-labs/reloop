import { Hr, Link, Text } from "react-email";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
	? `https://${process.env.NEXT_PUBLIC_BASE_URL}`
	: "https://reloop.sh";

export const Footer = () => {
	return (
		<>
			<Hr className="mx-0 my-[26px] w-full border border-[#eaeaea] border-solid" />
			<Text className="text-[#666666] text-[12px] leading-[24px]">
				If you need help, contact{" "}
				<Link href={`${baseUrl}/help`} className="text-blue-600 no-underline">
					Reloop Support
				</Link>
				.
			</Text>
			<Text className="text-[#666666] text-[12px] leading-[24px]">
				<Link
					href={`${baseUrl}/notifications`}
					className="text-[#666666] underline underline-offset-4"
				>
					Manage notification settings
				</Link>
			</Text>
			<br />
			<Text className="text-[#666666] text-[12px] leading-[24px]">
				Copyright © {new Date().getFullYear()} Reloop Inc. All rights reserved.
				<br />
				123 Dev Street, Bengaluru, KA 560001
			</Text>
		</>
	);
};
