import { Button as ReactEmailButton } from "@react-email/components";
import React from "react";

export const Button = () => (
	<ReactEmailButton
		className="box-border w-full rounded-[8px] bg-indigo-600 px-[12px] py-[12px] text-center font-semibold text-white"
		href="https://react.email"
	>
		Get started
	</ReactEmailButton>
);
