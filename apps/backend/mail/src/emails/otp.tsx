import { Section, Tailwind, Text } from "@react-email/components";
import * as React from "react";

export default function OTPEmail({ otp }: { otp: number }) {
	return (
		<Tailwind>
			<Section className="flex min-h-screen w-full items-center justify-center font-sans">
				<Section className="flex w-76 flex-col items-center rounded-2xl bg-gray-50 px-6 py-1">
					<Text className="font-medium text-violet-500 text-xs">
						Verify your Email Address
					</Text>
					<Text className="my-0 text-gray-500">
						Use the following code to verify your email address
					</Text>
					<Text className="pt-2 font-bold text-5xl">{otp}</Text>
					<Text className="pb-4 font-light text-gray-400 text-xs">
						This code is valid for 10 minutes
					</Text>
					<Text className="text-gray-600 text-xs">Thank you joining us</Text>
				</Section>
			</Section>
		</Tailwind>
	);
}

OTPEmail.PreviewProps = {
	otp: 123456,
};
