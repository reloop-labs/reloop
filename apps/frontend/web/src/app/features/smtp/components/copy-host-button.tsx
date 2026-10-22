"use client";

import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { SMTP_HOST } from "./smtp-data";

export function CopyHostButton() {
	const [copied, setCopied] = useState(false);

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(SMTP_HOST);
			setCopied(true);
			window.setTimeout(() => setCopied(false), 2000);
		} catch {
			// ignore
		}
	};

	return (
		<FancyButton.Root
			type="button"
			variant="basic"
			size="medium"
			onClick={handleCopy}
			aria-label={copied ? "Copied" : `Copy ${SMTP_HOST}`}
			className="h-10 min-w-[11.5rem] overflow-hidden rounded-xl px-5 font-medium text-[14.5px] sm:h-11 sm:min-w-[12.75rem] sm:px-6 sm:text-[15.5px]"
		>
			<AnimatePresence mode="popLayout" initial={false}>
				<motion.span
					key={copied ? "copied" : "idle"}
					transition={{ type: "spring", duration: 0.25, bounce: 0 }}
					initial={{ opacity: 0, y: -14 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: 14 }}
					className="flex items-center justify-center gap-2"
				>
					<Icon
						name={copied ? "check-circle" : "copy"}
						className="size-4 shrink-0"
					/>
					<span className={copied ? undefined : "font-mono text-[0.92em]"}>
						{copied ? "Copied!" : SMTP_HOST}
					</span>
				</motion.span>
			</AnimatePresence>
		</FancyButton.Root>
	);
}
