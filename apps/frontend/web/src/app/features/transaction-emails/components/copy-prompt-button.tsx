"use client";

import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

const TRANSACTIONAL_AI_PROMPT = `Add Reloop transactional email to this project.

I will set RELOOP_API_KEY in my .env (never commit the real key). Use this placeholder until I paste the real value:
RELOOP_API_KEY=rl_your_api_key_here

Do the following:
1. Detect this project's language and framework.
2. Install the correct Reloop SDK if one exists (Node/Python: reloop-email; Go: github.com/reloop-labs/reloop-go/v2; PHP: reloop/reloop-email), or call the REST API (POST https://reloop.sh/api/mail/v1/send) with Authorization: Bearer <key>.
3. Create a small sendEmail helper that reads the key from env and sends a transactional email:
   - from: sender@example.com
   - to: recipient@example.com
   - subject: Hello from Reloop
   - text: Hello World!
4. Pass an Idempotency-Key header on sends that may be retried (password resets, receipts) so users never get duplicates.
5. Follow this repo's conventions and handle errors cleanly.

Useful docs:
- SDKs & frameworks: https://reloop.sh/sdk
- API keys: https://reloop.sh/docs/learn/api-keys
- Send email: https://reloop.sh/docs/api/mail/post-api-mail-v1send
- Webhooks: https://reloop.sh/docs/webhooks
- SMTP: https://reloop.sh/docs/examples/smtp/introduction

Show only the files/code I need to add or change.`;

export function CopyPromptButton() {
	const [copied, setCopied] = useState(false);

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(TRANSACTIONAL_AI_PROMPT);
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
			aria-label={copied ? "Copied" : "Copy prompt"}
			className="h-10 min-w-[9.5rem] overflow-hidden rounded-xl px-5 font-medium text-[14.5px] sm:h-11 sm:min-w-[10.5rem] sm:px-6 sm:text-[15.5px]"
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
					<span>{copied ? "Copied!" : "Copy prompt"}</span>
				</motion.span>
			</AnimatePresence>
		</FancyButton.Root>
	);
}
