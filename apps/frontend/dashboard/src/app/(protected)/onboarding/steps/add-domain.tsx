"use client";

import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import { Globe, Loader2 } from "lucide-react";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { useState } from "react";

export const AddDomainStep = () => {
	const [domain, setDomain] = useQueryState(
		"domain",
		parseAsString.withDefault(""),
	);
	const [step, setStep] = useQueryState("step", parseAsInteger.withDefault(1));
	const [verifying, setVerifying] = useState(false);

	const handleVerify = () => {
		if (!domain) return;
		setVerifying(true);
		setTimeout(() => {
			setVerifying(false);
			setStep(step + 1);
		}, 1500);
	};

	return (
		<div className="fade-in animate-in space-y-6 duration-500">
			<div className="flex flex-col gap-1">
				<Label.Root htmlFor="domain-name">Domain Name</Label.Root>
				<div className="flex gap-3">
					<Input.Root className="flex-1">
						<Input.Wrapper>
							<Input.Icon>
								<Globe size={18} />
							</Input.Icon>
							<Input.Input
								id="domain-name"
								type="text"
								placeholder="e.g. news.reloop.sh"
								value={domain}
								onChange={(e) => setDomain(e.target.value)}
							/>
						</Input.Wrapper>
					</Input.Root>
				</div>
				<div className="mt-6">
					<div className="flex items-center gap-2 text-xs uppercase">
						<Icon name="bulb" className="h-3 w-3" />
						<p>Pro Tip</p>
					</div>
					<p className="pt-2 text-sm text-text-sub-600">
						Use separate domain for domain reputation
					</p>
					<div className="pt-3 text-sm text-text-sub-600">
						<p>Subdomain example:</p>
						<ul className="list-disc pl-5">
							<li>marketing.example.com</li>
							<li>send.example.com</li>
							<li>transection.example.com</li>
						</ul>
					</div>
				</div>
				<div className="pt-5">
					<Button.Root
						variant="neutral"
						mode="filled"
						className="w-full"
						onClick={handleVerify}
						disabled={!domain || verifying}
					>
						{verifying ? (
							<Loader2 className="mr-2 animate-spin" size={16} />
						) : null}
						{verifying ? "Verifying" : "Verify Domain"}
					</Button.Root>
				</div>
			</div>
		</div>
	);
};
