"use client";

import { useState } from "react";
import { Icon } from "@reloop/ui/icon";

export default function InboundWidget() {
	const [sender, setSender] = useState("john.doe@company.com");
	const [subject, setSubject] = useState("Bug report: checkout page crashing");
	const [body, setBody] = useState("Whenever I click 'Purchase', the app gets stuck on the loading spinner.");
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
				to: "support@reloop.dev",
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
								url: "https://cdn.reloop.dev/attachments/scr_1.png",
							},
					  ]
					: [],
				spamScore: 0.1,
				dkimStatus: "pass",
			},
		},
		null,
		2
	);

	return (
		<div className="flex flex-col h-full min-h-[420px] bg-slate-950 rounded-2xl border border-white/10 overflow-hidden shadow-2xl font-sans text-left">
			{/* Header */}
			<div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-white/5">
				<div className="flex items-center gap-1.5">
					<span className="w-2.5 h-2.5 rounded-full bg-cyan-500/80" />
					<span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
					<span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
					<span className="text-xs text-white/40 font-mono ml-2">inbound_router.json</span>
				</div>
				<span className="text-[10px] text-cyan-400 font-mono bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
					MX Webhook Relay
				</span>
			</div>

			<div className="flex-1 grid grid-cols-1 lg:grid-cols-2 overflow-hidden">
				{/* Left Side: Mock Email Input Form */}
				<div className="p-4 border-b lg:border-b-0 lg:border-r border-white/5 flex flex-col gap-3.5 bg-slate-950/40">
					<h3 className="text-xs font-bold text-white/40 uppercase tracking-wider flex items-center gap-1">
						<Icon name="Mail" className="w-3.5 h-3.5" />
						<span>Compose Inbound Email</span>
					</h3>

					<div className="flex flex-col gap-2.5">
						<div>
							<label className="text-[10px] text-white/40 font-mono block mb-1">FROM SENDER</label>
							<input
								type="text"
								value={sender}
								onChange={(e) => setSender(e.target.value)}
								className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white/80 focus:outline-none focus:border-cyan-500/50 font-mono"
							/>
						</div>

						<div>
							<label className="text-[10px] text-white/40 font-mono block mb-1">SUBJECT LINE</label>
							<input
								type="text"
								value={subject}
								onChange={(e) => setSubject(e.target.value)}
								className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white/80 focus:outline-none focus:border-cyan-500/50"
							/>
						</div>

						<div>
							<label className="text-[10px] text-white/40 font-mono block mb-1">MESSAGE BODY</label>
							<textarea
								value={body}
								onChange={(e) => setBody(e.target.value)}
								rows={3}
								className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white/80 focus:outline-none focus:border-cyan-500/50 resize-none leading-relaxed"
							/>
						</div>

						{/* Attachment simulator */}
						<button
							onClick={() => setHasAttachment(!hasAttachment)}
							className={`flex items-center justify-between p-2 rounded-lg border text-left transition-all cursor-pointer ${
								hasAttachment
									? "bg-cyan-950/20 border-cyan-500/30 text-cyan-300"
									: "bg-slate-900 border-white/5 text-white/40"
							}`}
						>
							<div className="flex items-center gap-1.5 text-xs">
								<Icon name="Paperclip" className="w-3.5 h-3.5" />
								<span>Include 100KB Screenshot</span>
							</div>
							<div className={`w-3 h-3 rounded-full border transition-colors ${hasAttachment ? "bg-cyan-400 border-cyan-400" : "border-white/20"}`} />
						</button>
					</div>
				</div>

				{/* Right Side: Parsed Webhook JSON Output */}
				<div className="p-4 flex flex-col gap-2.5 overflow-hidden">
					<h3 className="text-xs font-bold text-white/40 uppercase tracking-wider flex items-center gap-1 justify-between">
						<span className="flex items-center gap-1">
							<Icon name="Code" className="w-3.5 h-3.5" />
							<span>Webhook Payload Delivery</span>
						</span>
						<span className="text-[10px] text-emerald-400 font-mono">POST 200 OK</span>
					</h3>
					<pre className="flex-1 bg-slate-900 border border-white/5 rounded-xl p-3 font-mono text-[10px] text-cyan-300/80 leading-relaxed overflow-auto max-h-[260px] text-left">
						{generatedJson}
					</pre>
				</div>
			</div>
		</div>
	);
}
