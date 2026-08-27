"use client";

import * as Alert from "@reloop/ui/alert";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import Spinner from "@reloop/ui/spinner";
import { CopyField } from "@reloop/web/components/landing/tools/copy-field";
import { type FormEvent, useState } from "react";
import { type DkimGenerateResponse, generateDkimRecord } from "./generate-api";

export function GeneratorPanel() {
	const [domain, setDomain] = useState("");
	const [selector, setSelector] = useState("default");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [result, setResult] = useState<DkimGenerateResponse | null>(null);

	const onSubmit = async (e: FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(null);
		try {
			setResult(await generateDkimRecord({ domain, selector }));
		} catch (err) {
			setResult(null);
			setError((err as Error).message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="mx-auto max-w-3xl">
			<form
				onSubmit={onSubmit}
				className="space-y-4 rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-5 shadow-xs sm:p-6 dark:border-white/10 dark:bg-[#0b0b0b]"
			>
				<div className="block">
					<p className="mb-1.5 font-medium text-[13px] text-text-strong-950 dark:text-white">
						Domain
					</p>
					<Input.Root size="small">
						<Input.Wrapper>
							<Input.Input
								value={domain}
								onChange={(e) => setDomain(e.target.value)}
								placeholder="example.com"
								required
								autoComplete="off"
								spellCheck={false}
							/>
						</Input.Wrapper>
					</Input.Root>
				</div>

				<div className="block">
					<p className="mb-1.5 font-medium text-[13px] text-text-strong-950 dark:text-white">
						Selector
					</p>
					<Input.Root size="small">
						<Input.Wrapper>
							<Input.Input
								value={selector}
								onChange={(e) => setSelector(e.target.value)}
								placeholder="default"
								required
								autoComplete="off"
								spellCheck={false}
							/>
						</Input.Wrapper>
					</Input.Root>
				</div>

				<FancyButton.Root
					type="submit"
					variant="primary"
					size="small"
					disabled={loading || !domain.trim() || !selector.trim()}
				>
					{loading ? (
						<>
							<Spinner size={18} />
							<span>Generating 2048-bit key…</span>
						</>
					) : (
						<>
							<FancyButton.Icon>
								<Icon name="key" className="size-4" />
							</FancyButton.Icon>
							<span>Generate DKIM keys</span>
						</>
					)}
				</FancyButton.Root>
			</form>

			{error && (
				<Alert.Root
					variant="lighter"
					status="error"
					size="large"
					className="mt-6"
				>
					<Alert.Icon as={Icon} name="alert-triangle" />
					<p className="text-paragraph-sm">{error}</p>
				</Alert.Root>
			)}

			{result && (
				<div className="mt-5 space-y-4 rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-5 sm:p-6 dark:border-white/10 dark:bg-[#0b0b0b]">
					<CopyField label="DNS name" value={result.dnsName} />
					<CopyField label="TXT value" value={result.record} multiline />
					<CopyField
						label="Private key (shown once — not stored)"
						value={result.privateKey}
						multiline
						secret
					/>
					<Alert.Root variant="lighter" status="warning" size="large">
						<Alert.Icon as={Icon} name="alert-triangle" />
						<p className="text-paragraph-sm">
							Save the private key on your mail server now. Reloop does not log
							or persist it. Anyone with this key can sign mail as{" "}
							{result.domain}.
						</p>
					</Alert.Root>
				</div>
			)}
		</div>
	);
}
