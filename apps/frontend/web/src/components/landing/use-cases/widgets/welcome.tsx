"use client";

import { Icon } from "@reloop/ui/icon";
import { useState } from "react";

export default function WelcomeWidget() {
	const [userName, setUserName] = useState("Pranav");
	const [tasks, setTasks] = useState([
		{ id: 1, label: "Register account", completed: true },
		{ id: 2, label: "Create API Key", completed: false },
		{ id: 3, label: "Verify custom domain", completed: false },
	]);

	const toggleTask = (id: number) => {
		setTasks(
			tasks.map((task) =>
				task.id === id ? { ...task, completed: !task.completed } : task,
			),
		);
	};

	const completedCount = tasks.filter((t) => t.completed).length;

	return (
		<div className="flex h-full min-h-[420px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-950 text-left font-sans shadow-2xl">
			{/* Header */}
			<div className="flex items-center justify-between border-white/5 border-b bg-slate-900 px-4 py-3">
				<div className="flex items-center gap-1.5">
					<span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
					<span className="h-2.5 w-2.5 rounded-full bg-yellow-500/80" />
					<span className="h-2.5 w-2.5 rounded-full bg-green-500/80" />
					<span className="ml-2 font-mono text-white/40 text-xs">
						welcome_drip_variables.config
					</span>
				</div>
				<span className="rounded border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] text-emerald-400">
					Onboarding Drip
				</span>
			</div>

			<div className="grid flex-1 grid-cols-1 gap-4 p-4 md:grid-cols-2">
				{/* Left Side: Onboarding Settings */}
				<div className="flex flex-col gap-4 rounded-xl border border-white/5 bg-slate-900/40 p-4">
					<div>
						<label className="mb-1 block font-mono text-[10px] text-white/40">
							USER FIRST NAME
						</label>
						<input
							type="text"
							value={userName}
							onChange={(e) => setUserName(e.target.value)}
							className="w-full rounded border border-white/10 bg-slate-900 px-2.5 py-1.5 text-white text-xs focus:border-emerald-500/50 focus:outline-none"
						/>
					</div>

					<div className="flex flex-1 flex-col gap-2">
						<label className="block font-mono text-[10px] text-white/40">
							SIMULATED CHECKLIST PROGRESS
						</label>

						{tasks.map((task) => (
							<button
								key={task.id}
								onClick={() => toggleTask(task.id)}
								className={`flex cursor-pointer items-center gap-2.5 rounded-lg border p-2 text-left text-xs transition-colors ${
									task.completed
										? "border-emerald-500/30 bg-emerald-950/20 text-emerald-300"
										: "border-white/5 bg-slate-900 text-white/50"
								}`}
							>
								<div
									className={`flex h-3.5 w-3.5 items-center justify-center rounded border ${
										task.completed
											? "border-emerald-500 bg-emerald-500 text-white"
											: "border-white/20"
									}`}
								>
									{task.completed && (
										<Icon name="Check" className="h-2.5 w-2.5 stroke-[3]" />
									)}
								</div>
								<span>{task.label}</span>
							</button>
						))}
					</div>
				</div>

				{/* Right Side: Welcome Email Preview with Variables */}
				<div className="flex flex-col justify-between rounded-xl border border-white/5 bg-slate-900 p-3">
					<div className="flex flex-1 flex-col gap-3 rounded-lg border border-white/5 bg-slate-950 p-3.5 text-left">
						<div className="border-white/5 border-b pb-2">
							<div className="font-mono text-[9px] text-white/40">
								SUBJECT: Welcome to Reloop, {userName}!
							</div>
						</div>

						<div className="flex-1 space-y-3 text-white/80 text-xs leading-relaxed">
							<p className="font-semibold text-white">Hi {userName},</p>
							<p>
								We're thrilled to have you here. You have completed{" "}
								<strong className="font-mono text-emerald-400">
									{completedCount} of 3
								</strong>{" "}
								checklist onboarding steps.
							</p>

							{/* Checklist progress tracker card in email */}
							<div className="space-y-1.5 rounded-lg border border-white/5 bg-slate-900 p-2.5">
								<div className="flex items-center justify-between font-mono text-[9px] text-white/40">
									<span>SETUP PROGRESS</span>
									<span>{Math.round((completedCount / 3) * 100)}%</span>
								</div>
								<div className="h-1.5 w-full overflow-hidden rounded-full border border-white/5 bg-slate-950">
									<div
										className="h-full bg-emerald-500 transition-all duration-300"
										style={{ width: `${(completedCount / 3) * 100}%` }}
									/>
								</div>
							</div>

							{completedCount < 3 ? (
								<div className="w-full cursor-pointer rounded bg-emerald-600 py-1.5 text-center font-bold text-[9px] text-white shadow-emerald-600/10 shadow-lg">
									Complete Your Setup
								</div>
							) : (
								<div className="w-full rounded border border-white/5 bg-slate-800 py-1.5 text-center font-bold text-[9px] text-slate-400">
									Setup Completed! 🎉
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
