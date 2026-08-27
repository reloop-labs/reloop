"use client";

import * as Alert from "@reloop/ui/alert";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import Spinner from "@reloop/ui/spinner";
import { CopyField } from "@reloop/web/components/landing/tools/copy-field";
import { type FormEvent, useState } from "react";
import { generateSpfRecord, type SpfGenerateResponse } from "./generate-api";

function splitLines(value: string): string[] {
	return value
		.split(/[\n,]+/)
		.map((item) => item.trim())
		.filter(Boolean);
}

function splitIps(value: string): { ipv4: string[]; ipv6: string[] } {
	const ipv4: string[] = [];
	const ipv6: string[] = [];
	for (const item of splitLines(value)) {
		if (item.includes(":")) ipv6.push(item);
		else ipv4.push(item);
	}
	return { ipv4, ipv6 };
}

export function GeneratorPanel() {
	const [domain, setDomain] = useState("");
	const [ips, setIps] = useState("");
	const [includes, setIncludes] = useState("");
	const [includeA, setIncludeA] = useState(false);
	const [includeMx, setIncludeMx] = useState(true);
	const [policy, setPolicy] = useState<"~all" | "-all" | "?all">("~all");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [result, setResult] = useState<SpfGenerateResponse | null>(null);

	const onSubmit = async (e: FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(null);
		try {
			const { ipv4, ipv6 } = splitIps(ips);
			const res = await generateSpfRecord({
				domain,
				ipv4,
				ipv6,
				includes: splitLines(includes),
				a: includeA,
				mx: includeMx,
				policy,
			});
			setResult(res);
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

				<label className="block">
					<span className="mb-1.5 block font-medium text-[13px] text-text-strong-950 dark:text-white">
						Sending IPs (one per line)
					</span>
					<textarea
						value={ips}
						onChange={(e) => setIps(e.target.value)}
						placeholder={"203.0.113.10\n2001:db8::1"}
						rows={3}
						className="w-full rounded-xl border border-stroke-soft-200 bg-white px-3 py-2 font-mono text-[14px] outline-none focus:border-primary-base dark:border-white/10 dark:bg-black dark:text-white"
					/>
				</label>

				<label className="block">
					<span className="mb-1.5 block font-medium text-[13px] text-text-strong-950 dark:text-white">
						include: hosts (one per line)
					</span>
					<textarea
						value={includes}
						onChange={(e) => setIncludes(e.target.value)}
						placeholder="spf.reloop.sh"
						rows={2}
						className="w-full rounded-xl border border-stroke-soft-200 bg-white px-3 py-2 font-mono text-[14px] outline-none focus:border-primary-base dark:border-white/10 dark:bg-black dark:text-white"
					/>
				</label>

				<div className="flex flex-wrap gap-4 text-[14px] text-text-strong-950 dark:text-white">
					<label className="inline-flex items-center gap-2">
						<input
							type="checkbox"
							checked={includeMx}
							onChange={(e) => setIncludeMx(e.target.checked)}
						/>
						Include mx
					</label>
					<label className="inline-flex items-center gap-2">
						<input
							type="checkbox"
							checked={includeA}
							onChange={(e) => setIncludeA(e.target.checked)}
						/>
						Include a
					</label>
				</div>

				<label className="block max-w-xs">
					<span className="mb-1.5 block font-medium text-[13px] text-text-strong-950 dark:text-white">
						Terminal policy
					</span>
					<select
						value={policy}
						onChange={(e) =>
							setPolicy(e.target.value as "~all" | "-all" | "?all")
						}
						className="h-10 w-full rounded-xl border border-stroke-soft-200 bg-white px-3 text-[14px] dark:border-white/10 dark:bg-black dark:text-white"
					>
						<option value="~all">~all (softfail)</option>
						<option value="-all">-all (fail)</option>
						<option value="?all">?all (neutral)</option>
					</select>
				</label>

				<FancyButton.Root
					type="submit"
					variant="primary"
					size="small"
					disabled={loading || !domain.trim()}
				>
					{loading ? (
						<>
							<Spinner size={18} />
							<span>Generating…</span>
						</>
					) : (
						<>
							<FancyButton.Icon>
								<Icon name="file-text" className="size-4" />
							</FancyButton.Icon>
							<span>Generate SPF</span>
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
					<p className="text-[13px] text-text-sub-600 dark:text-white/50">
						DNS lookups: {result.lookupCount} / {result.lookupLimit}
					</p>
					{result.warnings.map((warning) => (
						<Alert.Root
							key={warning.code + warning.detail}
							variant="lighter"
							status={warning.severity === "fail" ? "error" : "warning"}
							size="large"
						>
							<Alert.Icon as={Icon} name="alert-triangle" />
							<div>
								<p className="font-medium text-label-sm">{warning.detail}</p>
								<p className="mt-0.5 text-paragraph-sm">{warning.fix}</p>
							</div>
						</Alert.Root>
					))}
				</div>
			)}
		</div>
	);
}
