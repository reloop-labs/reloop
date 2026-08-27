"use client";

import * as Alert from "@reloop/ui/alert";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import Spinner from "@reloop/ui/spinner";
import { CopyField } from "@reloop/web/components/landing/tools/copy-field";
import { type FormEvent, useState } from "react";
import {
	type DmarcAlignment,
	type DmarcGenerateResponse,
	type DmarcPolicy,
	generateDmarcRecord,
} from "./generate-api";

export function GeneratorPanel() {
	const [domain, setDomain] = useState("");
	const [policy, setPolicy] = useState<DmarcPolicy>("none");
	const [rua, setRua] = useState("");
	const [ruf, setRuf] = useState("");
	const [aspf, setAspf] = useState<DmarcAlignment>("r");
	const [adkim, setAdkim] = useState<DmarcAlignment>("r");
	const [pct, setPct] = useState(100);
	const [sp, setSp] = useState<DmarcPolicy | "">("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [result, setResult] = useState<DmarcGenerateResponse | null>(null);

	const onSubmit = async (e: FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(null);
		try {
			setResult(
				await generateDmarcRecord({
					domain,
					policy,
					rua: rua.trim() || undefined,
					ruf: ruf.trim() || undefined,
					aspf,
					adkim,
					pct,
					sp: sp || undefined,
				}),
			);
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

				<div className="grid gap-4 sm:grid-cols-2">
					<label className="block">
						<span className="mb-1.5 block font-medium text-[13px] text-text-strong-950 dark:text-white">
							Policy (p=)
						</span>
						<select
							value={policy}
							onChange={(e) => setPolicy(e.target.value as DmarcPolicy)}
							className="h-10 w-full rounded-xl border border-stroke-soft-200 bg-white px-3 text-[14px] dark:border-white/10 dark:bg-black dark:text-white"
						>
							<option value="none">none (monitor)</option>
							<option value="quarantine">quarantine</option>
							<option value="reject">reject</option>
						</select>
					</label>
					<label className="block">
						<span className="mb-1.5 block font-medium text-[13px] text-text-strong-950 dark:text-white">
							Subdomain policy (sp=)
						</span>
						<select
							value={sp}
							onChange={(e) => setSp(e.target.value as DmarcPolicy | "")}
							className="h-10 w-full rounded-xl border border-stroke-soft-200 bg-white px-3 text-[14px] dark:border-white/10 dark:bg-black dark:text-white"
						>
							<option value="">Same as p=</option>
							<option value="none">none</option>
							<option value="quarantine">quarantine</option>
							<option value="reject">reject</option>
						</select>
					</label>
				</div>

				<div className="block">
					<p className="mb-1.5 font-medium text-[13px] text-text-strong-950 dark:text-white">
						Aggregate reports (rua=)
					</p>
					<Input.Root size="small">
						<Input.Wrapper>
							<Input.Input
								value={rua}
								onChange={(e) => setRua(e.target.value)}
								placeholder="dmarc@example.com"
								autoComplete="off"
								spellCheck={false}
							/>
						</Input.Wrapper>
					</Input.Root>
				</div>

				<div className="block">
					<p className="mb-1.5 font-medium text-[13px] text-text-strong-950 dark:text-white">
						Forensic reports (ruf=, optional)
					</p>
					<Input.Root size="small">
						<Input.Wrapper>
							<Input.Input
								value={ruf}
								onChange={(e) => setRuf(e.target.value)}
								placeholder="dmarc-forensic@example.com"
								autoComplete="off"
								spellCheck={false}
							/>
						</Input.Wrapper>
					</Input.Root>
				</div>

				<div className="grid gap-4 sm:grid-cols-3">
					<label className="block">
						<span className="mb-1.5 block font-medium text-[13px] text-text-strong-950 dark:text-white">
							aspf
						</span>
						<select
							value={aspf}
							onChange={(e) => setAspf(e.target.value as DmarcAlignment)}
							className="h-10 w-full rounded-xl border border-stroke-soft-200 bg-white px-3 text-[14px] dark:border-white/10 dark:bg-black dark:text-white"
						>
							<option value="r">relaxed (r)</option>
							<option value="s">strict (s)</option>
						</select>
					</label>
					<label className="block">
						<span className="mb-1.5 block font-medium text-[13px] text-text-strong-950 dark:text-white">
							adkim
						</span>
						<select
							value={adkim}
							onChange={(e) => setAdkim(e.target.value as DmarcAlignment)}
							className="h-10 w-full rounded-xl border border-stroke-soft-200 bg-white px-3 text-[14px] dark:border-white/10 dark:bg-black dark:text-white"
						>
							<option value="r">relaxed (r)</option>
							<option value="s">strict (s)</option>
						</select>
					</label>
					<div className="block">
						<p className="mb-1.5 font-medium text-[13px] text-text-strong-950 dark:text-white">
							pct
						</p>
						<Input.Root size="small">
							<Input.Wrapper>
								<Input.Input
									type="number"
									min={0}
									max={100}
									value={pct}
									onChange={(e) => setPct(Number(e.target.value))}
								/>
							</Input.Wrapper>
						</Input.Root>
					</div>
				</div>

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
							<span>Generate DMARC</span>
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
