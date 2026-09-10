"use client";

import { Icon } from "@reloop/ui/icon";
import { useState } from "react";

export default function InboundWidget() {
	const [sender, setSender] = useState("john.doe@company.com");
	const [subject, setSubject] = useState("Bug report: checkout page crashing");
	const [body, setBody] = useState(
		"Whenever I click 'Purchase', the app gets stuck on the loading spinner.",
	);
	const [hasAttachment, setHasAttachment] = useState(true);

	const [timestamp] = useState("2026-07-07T08:00:00.000Z");

	// JSON response mapping
	const generatedJson = JSON.stringify(
		{
			event: "email.received",
			timestamp: timestamp,
			data: {
				id: "msg_inbound_982341",
				from: {
					name: (sender.split("@")[0] || "user").replace(".", " "),
					email: sender,
				},
				to: "support@reloop.sh",
				subject: subject,
				body: {
					text: body,
					html: `<div>${body}</div>`,
				},
				attachments: hasAttachment
					? [
							{
								filename: "screenshot.png",
								contentType: "image/png",
								sizeBytes: 104857,
								url: "https://cdn.reloop.sh/attachments/scr_1.png",
							},
						]
					: [],
				spamScore: 0.1,
				dkimStatus: "pass",
			},
		},
		null,
		2,
	);

	return (
		<div className="flex h-full min-h-[420px] flex-col overflow-hidden rounded-2xl border border-stroke-soft-200 bg-bg-white-0 text-left font-sans shadow-lg dark:border-white/10 dark:bg-slate-950 dark:shadow-2xl">
			{/* Header */}
			<div className="flex items-center justify-between border-stroke-soft-200 border-b bg-bg-weak-50 px-4 py-3 dark:border-white/5 dark:bg-slate-900">
				<div className="flex items-center gap-1.5">
					<span className="h-2.5 w-2.5 rounded-full bg-cyan-500/80" />
					<span className="h-2.5 w-2.5 rounded-full bg-yellow-500/80" />
					<span className="h-2.5 w-2.5 rounded-full bg-green-500/80" />
					<span className="ml-2 font-mono text-text-sub-600 text-xs dark:text-white/40">
						inbound_router.json
					</span>
				</div>
				<span className="rounded border border-cyan-500/20 bg-cyan-500/10 px-2 py-0.5 font-mono text-[10px] text-cyan-600 dark:text-cyan-400">
					MX Webhook Relay
				</span>
			</div>

			<div className="grid flex-1 grid-cols-1 overflow-hidden lg:grid-cols-2">
				{/* Left Side: Mock Email Input Form */}
				<div className="flex flex-col gap-3.5 border-stroke-soft-200 border-b bg-bg-weak-50/40 p-4 lg:border-r lg:border-b-0 dark:border-white/5 dark:bg-slate-950/40">
					<h3 className="flex items-center gap-1 font-bold text-text-sub-600 text-xs uppercase tracking-wider dark:text-white/40">
						<Icon name="Mail" className="h-3.5 w-3.5" />
						<span>Compose Inbound Email</span>
					</h3>

					<div className="flex flex-col gap-2.5">
						<div>
							<label className="mb-1 block font-mono text-[10px] text-text-sub-600 dark:text-white/40">
								FROM SENDER
							</label>
							<input
								type="text"
								value={sender}
								onChange={(e) => setSender(e.target.value)}
								className="w-full rounded-lg border border-stroke-soft-200 bg-bg-weak-50 px-3 py-1.5 font-mono text-text-strong-950 text-xs focus:border-cyan-500/50 focus:outline-none dark:border-white/10 dark:bg-slate-900 dark:text-white/80"
							/>
						</div>

						<div>
							<label className="mb-1 block font-mono text-[10px] text-text-sub-600 dark:text-white/40">
								SUBJECT LINE
							</label>
							<input
								type="text"
								value={subject}
								onChange={(e) => setSubject(e.target.value)}
								className="w-full rounded-lg border border-stroke-soft-200 bg-bg-weak-50 px-3 py-1.5 text-text-strong-950 text-xs focus:border-cyan-500/50 focus:outline-none dark:border-white/10 dark:bg-slate-900 dark:text-white/80"
							/>
						</div>

						<div>
							<label className="mb-1 block font-mono text-[10px] text-text-sub-600 dark:text-white/40">
								MESSAGE BODY
							</label>
							<textarea
								value={body}
								onChange={(e) => setBody(e.target.value)}
								rows={3}
								className="w-full resize-none rounded-lg border border-stroke-soft-200 bg-bg-weak-50 px-3 py-1.5 text-text-strong-950 text-xs leading-relaxed focus:border-cyan-500/50 focus:outline-none dark:border-white/10 dark:bg-slate-900 dark:text-white/80"
							/>
						</div>

						{/* Attachment simulator */}
						<button
							onClick={() => setHasAttachment(!hasAttachment)}
							className={`flex cursor-pointer items-center justify-between rounded-lg border p-2 text-left transition-all ${
								hasAttachment
									? "border-cyan-500/30 bg-cyan-50 text-cyan-600 dark:bg-cyan-950/20 dark:text-cyan-300"
									: "border-stroke-soft-200 bg-bg-weak-50 text-text-sub-600 dark:border-white/5 dark:bg-slate-900 dark:text-white/40"
							}`}
						>
							<div className="flex items-center gap-1.5 text-xs">
								<Icon name="Paperclip" className="h-3.5 w-3.5" />
								<span>Include 100KB Screenshot</span>
							</div>
							<div
								className={`h-3 w-3 rounded-full border transition-colors ${hasAttachment ? "border-cyan-400 bg-cyan-400" : "border-stroke-soft-200 dark:border-white/20"}`}
							/>
						</button>
					</div>
				</div>

				{/* Right Side: Parsed Webhook JSON Output */}
				<div className="flex flex-col gap-2.5 overflow-hidden p-4">
					<h3 className="flex items-center justify-between gap-1 font-bold text-text-sub-600 text-xs uppercase tracking-wider dark:text-white/40">
						<span className="flex items-center gap-1">
							<Icon name="Code" className="h-3.5 w-3.5" />
							<span>Webhook Payload Delivery</span>
						</span>
						<span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400">
							POST 200 OK
						</span>
					</h3>
					<pre className="max-h-[260px] flex-1 overflow-auto rounded-xl border border-stroke-soft-200 bg-bg-weak-50 p-3 text-left font-mono text-[10px] text-cyan-700 leading-relaxed dark:border-white/5 dark:bg-slate-900 dark:text-cyan-300/80">
						{generatedJson}
					</pre>
				</div>
			</div>
		</div>
	);
}
