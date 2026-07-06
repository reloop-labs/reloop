"use client";

import { ToolUpsell } from "@reloop/web/components/landing/tools/tool-chrome";
import Link from "next/link";
import { useState } from "react";

const DEFAULT_HTML = `<div style="font-family:system-ui,sans-serif;padding:16px;">
  <h2 style="margin:0 0 8px;font-size:20px;">Your headline</h2>
  <p style="margin:0 0 16px;color:#555;line-height:1.5;">Body copy preview on mobile devices.</p>
  <a href="#" style="display:inline-block;padding:10px 18px;background:#111;color:#fff;text-decoration:none;border-radius:8px;font-size:14px;">Call to action</a>
</div>`;

type Device = "iphone" | "android" | "desktop";

const DEVICES: { id: Device; label: string; width: string }[] = [
	{ id: "iphone", label: "iPhone", width: "390px" },
	{ id: "android", label: "Android", width: "360px" },
	{ id: "desktop", label: "Desktop", width: "100%" },
];

export function MobilePreviewPageView() {
	const [html, setHtml] = useState(DEFAULT_HTML);
	const [device, setDevice] = useState<Device>("iphone");

	const frameWidth = DEVICES.find((d) => d.id === device)?.width ?? "390px";

	return (
		<div className="min-h-screen bg-[#1e1b4b] text-white">
			<div className="border-white/10 border-b bg-[#151233]">
				<div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
					<nav className="mb-3 text-[13px] text-white/40">
						<Link href="/tools" className="hover:text-indigo-300">
							Tools
						</Link>
						<span className="mx-2">/</span>
						<span className="text-white/70">Mobile Preview</span>
					</nav>
					<h1 className="font-semibold text-2xl sm:text-3xl">
						Email Client Preview
					</h1>
					<p className="mt-2 max-w-xl text-[15px] text-white/55">
						Split editor and device preview—like Litmus and Email on Acid mobile
						views.
					</p>
				</div>
			</div>

			<div className="mx-auto grid max-w-6xl gap-0 lg:grid-cols-2">
				<div className="border-white/10 border-b p-6 lg:border-r lg:border-b-0">
					<label className="font-medium text-[13px] text-white/70">HTML</label>
					<textarea
						value={html}
						onChange={(e) => setHtml(e.target.value)}
						rows={18}
						className="mt-2 w-full rounded-lg border border-white/10 bg-black/40 p-4 font-mono text-[12px] text-white/80 outline-none focus:border-indigo-400"
					/>
					<div className="mt-4 flex flex-wrap gap-2">
						{DEVICES.map((d) => (
							<button
								key={d.id}
								type="button"
								onClick={() => setDevice(d.id)}
								className={`rounded-full px-4 py-1.5 font-medium text-[13px] ${
									device === d.id
										? "bg-indigo-500 text-white"
										: "bg-white/10 text-white/60 hover:bg-white/15"
								}`}
							>
								{d.label}
							</button>
						))}
					</div>
				</div>

				<div className="flex min-h-[520px] items-center justify-center bg-[#0f0d24] p-8">
					<div
						className="overflow-hidden rounded-[2rem] border-[#2a2744] border-[10px] bg-white shadow-2xl transition-all"
						style={{
							width: device === "desktop" ? "100%" : frameWidth,
							maxWidth: device === "desktop" ? "640px" : frameWidth,
						}}
					>
						{device !== "desktop" && (
							<div className="flex h-6 items-center justify-center bg-[#f4f4f5]">
								<div className="h-1 w-16 rounded-full bg-black/10" />
							</div>
						)}
						<div
							className="min-h-[420px] overflow-auto bg-white text-black"
							// biome-ignore lint/security/noDangerouslySetInnerHtml: preview tool
							dangerouslySetInnerHTML={{ __html: html }}
						/>
					</div>
				</div>
			</div>

			<ToolUpsell
				title="Preview campaigns before send"
				description="Design responsive emails in Reloop and preview across clients in the dashboard."
				primaryHref="/features/campaign-builder"
				primaryLabel="Campaign builder"
				secondaryHref="/dashboard/signup"
				secondaryLabel="Start free"
			/>
		</div>
	);
}
