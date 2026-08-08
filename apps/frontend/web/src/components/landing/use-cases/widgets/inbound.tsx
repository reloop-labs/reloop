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
		<div className="flex h-full min-h-[420px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-950 text-left font-sans shadow-2xl">
			{/* Header */}
			<div className="flex items-center justify-between border-white/5 border-b bg-slate-900 px-4 py-3">
				<div className="flex items-center gap-1.5">
					<span className="h-2.5 w-2.5 rounded-full bg-cyan-500/80" />
					<span className="h-2.5 w-2.5 rounded-full bg-yellow-500/80" />
					<span className="h-2.5 w-2.5 rounded-full bg-green-500/80" />
					<span className="ml-2 font-mono text-white/40 text-xs">
						inbound_router.json
					</span>
				</div>
				<span className="rounded border border-cyan-500/20 bg-cyan-500/10 px-2 py-0.5 font-mono text-[10px] text-cyan-400">
					MX Webhook Relay
				</span>
			</div>

			<div className="grid flex-1 grid-cols-1 overflow-hidden lg:grid-cols-2">
				{/* Left Side: Mock Email Input Form */}
				<div className="flex flex-col gap-3.5 border-white/5 border-b bg-slate-950/40 p-4 lg:border-r lg:border-b-0">
					<h3 className="flex items-center gap-1 font-bold text-white/40 text-xs uppercase tracking-wider">
						<Icon name="Mail" className="h-3.5 w-3.5" />
						<span>Compose Inbound Email</span>
					</h3>

					<div className="flex flex-col gap-2.5">
						<div>
							<label className="mb-1 block font-mono text-[10px] text-white/40">
								FROM SENDER
							</label>
							<input
								type="text"
								value={sender}
								onChange={(e) => setSender(e.target.value)}
								className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-1.5 font-mono text-white/80 text-xs focus:border-cyan-500/50 focus:outline-none"
							/>
						</div>

						<div>
							<label className="mb-1 block font-mono text-[10px] text-white/40">
								SUBJECT LINE
							</label>
							<input
								type="text"
								value={subject}
								onChange={(e) => setSubject(e.target.value)}
								className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-1.5 text-white/80 text-xs focus:border-cyan-500/50 focus:outline-none"
							/>
						</div>

						<div>
							<label className="mb-1 block font-mono text-[10px] text-white/40">
								MESSAGE BODY
							</label>
							<textarea
								value={body}
								onChange={(e) => setBody(e.target.value)}
								rows={3}
								className="w-full resize-none rounded-lg border border-white/10 bg-slate-900 px-3 py-1.5 text-white/80 text-xs leading-relaxed focus:border-cyan-500/50 focus:outline-none"
							/>
						</div>

						{/* Attachment simulator */}
						<button
							onClick={() => setHasAttachment(!hasAttachment)}
							className={`flex cursor-pointer items-center justify-between rounded-lg border p-2 text-left transition-all ${
								hasAttachment
									? "border-cyan-500/30 bg-cyan-950/20 text-cyan-300"
									: "border-white/5 bg-slate-900 text-white/40"
							}`}
						>
							<div className="flex items-center gap-1.5 text-xs">
								<Icon name="Paperclip" className="h-3.5 w-3.5" />
								<span>Include 100KB Screenshot</span>
							</div>
							<div
								className={`h-3 w-3 rounded-full border transition-colors ${hasAttachment ? "border-cyan-400 bg-cyan-400" : "border-white/20"}`}
							/>
						</button>
					</div>
				</div>

				{/* Right Side: Parsed Webhook JSON Output */}
				<div className="flex flex-col gap-2.5 overflow-hidden p-4">
					<h3 className="flex items-center justify-between gap-1 font-bold text-white/40 text-xs uppercase tracking-wider">
						<span className="flex items-center gap-1">
							<Icon name="Code" className="h-3.5 w-3.5" />
							<span>Webhook Payload Delivery</span>
						</span>
						<span className="font-mono text-[10px] text-emerald-400">
							POST 200 OK
						</span>
					</h3>
					<pre className="max-h-[260px] flex-1 overflow-auto rounded-xl border border-white/5 bg-slate-900 p-3 text-left font-mono text-[10px] text-cyan-300/80 leading-relaxed">
						{generatedJson}
					</pre>
				</div>
			</div>
		</div>
	);
}
