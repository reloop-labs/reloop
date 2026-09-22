import * as Alert from "@reloop/ui/alert";
import * as Badge from "@reloop/ui/badge";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import Spinner from "@reloop/ui/spinner";
import * as StatusBadge from "@reloop/ui/status-badge";
import * as Table from "@reloop/ui/table";
import { useCallback, useEffect, useMemo, useState } from "react";
import { api, type PlanItem, type Product, type RunSummary, type Submission } from "./api";

type Row =
	| { kind: "plan"; item: PlanItem }
	| { kind: "run"; item: Submission };

function verdictBadge(verdict: PlanItem["verdict"]) {
	const color =
		verdict === "ready" ? "green" : verdict === "fixable" ? "orange" : "gray";
	return (
		<Badge.Root variant="light" color={color} size="medium">
			{verdict.replaceAll("_", " ")}
		</Badge.Root>
	);
}

function runStatusBadge(status: string) {
	const map: Record<string, "completed" | "pending" | "failed" | "disabled"> = {
		submitted: "completed",
		live: "completed",
		ready: "completed",
		needs_human: "pending",
		running: "pending",
		queued: "pending",
		paused: "pending",
		failed: "failed",
		skipped: "disabled",
		out_of_reach: "disabled",
	};
	const mapped = map[status] ?? "disabled";
	return (
		<StatusBadge.Root variant="light" status={mapped}>
			<StatusBadge.Dot />
			{status.replaceAll("_", " ")}
		</StatusBadge.Root>
	);
}

export function App() {
	const [products, setProducts] = useState<Product[]>([]);
	const [productId, setProductId] = useState("");
	const [plan, setPlan] = useState<PlanItem[]>([]);
	const [run, setRun] = useState<RunSummary | null>(null);
	const [mode, setMode] = useState<"plan" | "run">("plan");
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const selected = products.find((p) => p.id === productId);
	const productLabel = selected?.name ?? "your product";

	const steps = useMemo(
		() => [
			{
				n: "1",
				title: "Pick a product pack",
				body: `Choose which app to submit. Packs live in products/*.json (name, URL, tagline, description).`,
			},
			{
				n: "2",
				title: "Check eligibility",
				body: `See which free directories look open for ${productLabel} — nothing is submitted yet.`,
			},
			{
				n: "3",
				title: "Practice safely",
				body: "Simulate a run and write logs only. No browser, no real forms.",
			},
			{
				n: "4",
				title: "Submit for real",
				body: "Opens a browser and fills forms one by one. Captchas pause and notify you.",
			},
		],
		[productLabel],
	);

	const needsHuman = useMemo(() => {
		if (run?.status === "paused") return true;
		return Boolean(run?.submissions?.some((s) => s.status === "needs_human"));
	}, [run]);

	const loadPlanFor = useCallback(async (id: string) => {
		if (!id) return;
		const data = await api.plan(id);
		setPlan(data.plan);
		setMode("plan");
		setRun(null);
	}, []);

	const loadProducts = useCallback(async () => {
		const list = await api.products();
		setProducts(list);
		const nextId = list[0]?.id ?? "";
		setProductId(nextId);
		if (nextId) await loadPlanFor(nextId);
	}, [loadPlanFor]);

	const doPlan = useCallback(async () => {
		if (!productId) return;
		setBusy(true);
		setError(null);
		try {
			await loadPlanFor(productId);
		} catch (err) {
			setError(err instanceof Error ? err.message : String(err));
		} finally {
			setBusy(false);
		}
	}, [productId, loadPlanFor]);

	const doRun = useCallback(
		async (dryRun: boolean) => {
			if (!productId) return;
			if (!dryRun) {
				const ok = window.confirm(
					`This will open a real browser and try to submit ${productLabel} to ${plan.filter((p) => p.verdict === "ready").length} free directories one by one.\n\nCaptchas/logins will pause and alert you.\n\nContinue?`,
				);
				if (!ok) return;
			}
			setBusy(true);
			setError(null);
			try {
				const data = await api.run({ productId, dryRun });
				setRun(data);
				setMode("run");
			} catch (err) {
				setError(err instanceof Error ? err.message : String(err));
			} finally {
				setBusy(false);
			}
		},
		[productId, plan, productLabel],
	);

	const doStatus = useCallback(async () => {
		setBusy(true);
		setError(null);
		try {
			const data = await api.status();
			if (data.submissions?.length) {
				setRun(data);
				setMode("run");
			} else {
				setError("No submission run yet. Use Practice or Submit first.");
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : String(err));
		} finally {
			setBusy(false);
		}
	}, []);

	const doResume = useCallback(async () => {
		setBusy(true);
		setError(null);
		try {
			const data = await api.resume();
			setRun(data);
			setMode("run");
		} catch (err) {
			setError(err instanceof Error ? err.message : String(err));
		} finally {
			setBusy(false);
		}
	}, []);

	useEffect(() => {
		void loadProducts().catch((err) =>
			setError(err instanceof Error ? err.message : String(err)),
		);
	}, [loadProducts]);

	useEffect(() => {
		if (!needsHuman) return;
		const id = window.setInterval(() => {
			void api.status().then(setRun).catch(() => undefined);
		}, 5000);
		return () => window.clearInterval(id);
	}, [needsHuman]);

	const rows: Row[] =
		mode === "run" && run?.submissions?.length
			? run.submissions.map((item) => ({ kind: "run", item }))
			: plan.map((item) => ({ kind: "plan", item }));

	const readyCount = plan.filter((p) => p.verdict === "ready").length;

	return (
		<div className="min-h-screen bg-bg-weak-50">
			<header className="border-stroke-soft-200 border-b bg-bg-white-0">
				<div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4 lg:px-8">
					<div className="flex items-center gap-3">
						<span className="font-semibold text-label-md text-text-strong-950 tracking-tight">
							Launch Submitter
						</span>
						<div className="h-5 w-px bg-stroke-soft-200" />
						<span className="text-paragraph-xs text-text-sub-600">
							Directory launch helper
						</span>
					</div>
					<span className="text-paragraph-xs text-text-soft-400">
						Local · free platforms only
					</span>
				</div>
			</header>

			<main className="mx-auto max-w-6xl space-y-6 p-6 lg:p-8">
				<div className="space-y-2">
					<h1 className="font-semibold text-[26px] text-text-strong-950 tracking-tight">
						Submit a product to launch directories
					</h1>
					<p className="max-w-2xl text-paragraph-sm text-text-sub-600">
						Add a pack under <code className="text-text-strong-950">products/*.json</code>, pick it
						below, then fill free directory forms automatically. Works for any product — not tied to
						one brand.
					</p>
				</div>

				<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
					{steps.map((step) => (
						<div
							key={step.n}
							className="rounded-2xl bg-bg-white-0 p-4 shadow-regular-xs ring-1 ring-stroke-soft-200 ring-inset"
						>
							<div className="mb-2 flex size-7 items-center justify-center rounded-full bg-bg-weak-50 font-medium text-label-xs text-text-sub-600">
								{step.n}
							</div>
							<div className="font-medium text-label-sm text-text-strong-950">{step.title}</div>
							<p className="mt-1 text-paragraph-xs text-text-sub-600">{step.body}</p>
						</div>
					))}
				</div>

				<div className="rounded-2xl bg-bg-white-0 p-4 shadow-regular-xs ring-1 ring-stroke-soft-200 ring-inset sm:p-5">
					<div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
						<label className="flex min-w-48 flex-col gap-1.5">
							<span className="text-label-xs text-text-sub-600">Product pack</span>
							<select
								value={productId}
								onChange={(e) => {
									const id = e.target.value;
									setProductId(id);
									void loadPlanFor(id).catch((err) =>
										setError(err instanceof Error ? err.message : String(err)),
									);
								}}
								disabled={products.length === 0}
								className={cn(
									"h-10 min-w-48 rounded-xl bg-bg-white-0 px-3 text-paragraph-sm text-text-strong-950",
									"ring-1 ring-stroke-soft-100 ring-inset outline-none",
									"hover:bg-bg-weak-50 focus:ring-stroke-strong-950",
									"disabled:bg-bg-weak-50 disabled:text-text-disabled-300",
								)}
							>
								{products.length === 0 ? (
									<option value="">No products/*.json found</option>
								) : (
									products.map((p) => (
										<option key={p.id} value={p.id}>
											{p.name} — {p.url}
										</option>
									))
								)}
							</select>
							{selected ? (
								<span className="text-paragraph-xs text-text-soft-400">{selected.url}</span>
							) : (
								<span className="text-paragraph-xs text-text-soft-400">
									Create products/my-app.json to get started
								</span>
							)}
						</label>

						<div className="flex flex-wrap items-center gap-2">
							<Button.Root
								type="button"
								variant="neutral"
								mode="stroke"
								size="small"
								disabled={busy || !productId}
								onClick={() => void doPlan()}
							>
								Show where it qualifies
							</Button.Root>
							<Button.Root
								type="button"
								variant="neutral"
								mode="stroke"
								size="small"
								disabled={busy || !productId}
								onClick={() => void doRun(true)}
							>
								Practice (no browser)
							</Button.Root>
							<Button.Root
								type="button"
								variant="neutral"
								mode="stroke"
								size="small"
								disabled={busy}
								onClick={() => void doStatus()}
							>
								Refresh run status
							</Button.Root>
							<Button.Root
								type="button"
								variant="neutral"
								mode="stroke"
								size="small"
								disabled={busy || !needsHuman}
								onClick={() => void doResume()}
							>
								Continue after captcha
							</Button.Root>
							<FancyButton.Root
								type="button"
								variant="blue"
								size="small"
								disabled={busy || !productId || readyCount === 0}
								onClick={() => void doRun(false)}
							>
								{busy ? <Spinner className="size-4" /> : null}
								Submit to all free platforms ({readyCount})
							</FancyButton.Root>
						</div>
					</div>
				</div>

				{needsHuman ? (
					<Alert.Root
						variant="lighter"
						status="warning"
						size="large"
						className="rounded-2xl ring-1 ring-stroke-soft-200 ring-inset"
					>
						<div className="space-y-0.5">
							<div className="font-medium text-label-md text-text-strong-950">
								Paused — finish captcha or login in the browser window
							</div>
							<p className="text-paragraph-sm text-text-sub-600">
								Then click “Continue after captcha”. You’ll also get a macOS notification + sound.
							</p>
						</div>
					</Alert.Root>
				) : null}

				{error ? (
					<Alert.Root
						variant="lighter"
						status="error"
						size="large"
						className="rounded-2xl ring-1 ring-stroke-soft-200 ring-inset"
					>
						<p className="text-paragraph-sm">{error}</p>
					</Alert.Root>
				) : null}

				<div className="flex flex-wrap items-center gap-2">
					{run?.counts ? (
						Object.entries(run.counts).map(([key, value]) => (
							<Badge.Root key={key} variant="stroke" color="gray" size="medium">
								{key.replaceAll("_", " ")} · {value}
							</Badge.Root>
						))
					) : (
						<>
							<Badge.Root variant="stroke" color="gray" size="medium">
								{plan.length} free platforms in catalog
							</Badge.Root>
							<Badge.Root variant="light" color="green" size="medium">
								{readyCount} look eligible
							</Badge.Root>
						</>
					)}
					<span className="text-paragraph-xs text-text-soft-400">
						{mode === "run"
							? `Showing last run for ${productLabel}`
							: productId
								? `Eligibility for ${productLabel} (not submitted yet)`
								: "Add a product pack to continue"}
					</span>
				</div>

				<div className="overflow-hidden rounded-2xl bg-bg-white-0 p-2 shadow-regular-xs ring-1 ring-stroke-soft-200 ring-inset">
					<Table.Root>
						<Table.Header>
							<Table.Row>
								<Table.Head>Platform</Table.Head>
								<Table.Head>{mode === "run" ? "Submission" : "Eligibility"}</Table.Head>
								<Table.Head>Notes</Table.Head>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{rows.length === 0 ? (
								<Table.Row>
									<Table.Cell colSpan={3} className="text-paragraph-sm text-text-sub-600">
										{busy
											? "Loading…"
											: productId
												? "Click “Show where it qualifies” to load the list."
												: "Add a JSON file under products/ first."}
									</Table.Cell>
								</Table.Row>
							) : (
								rows.map((row) => {
									if (row.kind === "plan") {
										const item = row.item;
										return (
											<Table.Row key={item.directoryId}>
												<Table.Cell>
													<div className="space-y-0.5">
														<div className="font-medium text-label-sm text-text-strong-950">
															{item.directoryName}
														</div>
														<div className="text-paragraph-xs text-text-soft-400">
															{item.domainRating != null ? `DR ${item.domainRating}` : "DR ?"}
															{item.requiresAccount ? " · needs login first" : ""}
														</div>
													</div>
												</Table.Cell>
												<Table.Cell>{verdictBadge(item.verdict)}</Table.Cell>
												<Table.Cell className="max-w-md text-paragraph-sm text-text-sub-600">
													{item.reasons.join("; ")}
												</Table.Cell>
											</Table.Row>
										);
									}
									const item = row.item;
									return (
										<Table.Row key={item.directoryId}>
											<Table.Cell>
												<div className="font-medium text-label-sm text-text-strong-950">
													{item.directoryName}
												</div>
											</Table.Cell>
											<Table.Cell>{runStatusBadge(item.status)}</Table.Cell>
											<Table.Cell className="max-w-md text-paragraph-sm text-text-sub-600">
												{item.note || item.error || item.url || "—"}
											</Table.Cell>
										</Table.Row>
									);
								})
							)}
						</Table.Body>
					</Table.Root>
				</div>
			</main>
		</div>
	);
}
