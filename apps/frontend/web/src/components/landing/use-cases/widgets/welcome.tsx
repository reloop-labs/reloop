"use client";

import { useState } from "react";
import { Icon } from "@reloop/ui/icon";

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
				task.id === id ? { ...task, completed: !task.completed } : task
			)
		);
	};

	const completedCount = tasks.filter((t) => t.completed).length;

	return (
		<div className="flex flex-col h-full min-h-[420px] bg-slate-950 rounded-2xl border border-white/10 overflow-hidden shadow-2xl font-sans text-left">
			{/* Header */}
			<div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-white/5">
				<div className="flex items-center gap-1.5">
					<span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
					<span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
					<span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
					<span className="text-xs text-white/40 font-mono ml-2">welcome_drip_variables.config</span>
				</div>
				<span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
					Onboarding Drip
				</span>
			</div>

			<div className="flex-1 p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
				{/* Left Side: Onboarding Settings */}
				<div className="bg-slate-900/40 p-4 rounded-xl border border-white/5 flex flex-col gap-4">
					<div>
						<label className="text-[10px] text-white/40 font-mono block mb-1">USER FIRST NAME</label>
						<input
							type="text"
							value={userName}
							onChange={(e) => setUserName(e.target.value)}
							className="w-full bg-slate-900 border border-white/10 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500/50"
						/>
					</div>

					<div className="flex-1 flex flex-col gap-2">
						<label className="text-[10px] text-white/40 font-mono block">SIMULATED CHECKLIST PROGRESS</label>
						
						{tasks.map((task) => (
							<button
								key={task.id}
								onClick={() => toggleTask(task.id)}
								className={`flex items-center gap-2.5 p-2 rounded-lg border text-left text-xs transition-colors cursor-pointer ${
									task.completed
										? "bg-emerald-950/20 border-emerald-500/30 text-emerald-300"
										: "bg-slate-900 border-white/5 text-white/50"
								}`}
							>
								<div className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
									task.completed ? "bg-emerald-500 border-emerald-500 text-white" : "border-white/20"
								}`}>
									{task.completed && <Icon name="Check" className="w-2.5 h-2.5 stroke-[3]" />}
								</div>
								<span>{task.label}</span>
							</button>
						))}
					</div>
				</div>

				{/* Right Side: Welcome Email Preview with Variables */}
				<div className="bg-slate-900 border border-white/5 rounded-xl p-3 flex flex-col justify-between">
					<div className="border border-white/5 bg-slate-950 rounded-lg p-3.5 flex-1 text-left flex flex-col gap-3">
						<div className="border-b border-white/5 pb-2">
							<div className="text-[9px] text-white/40 font-mono">SUBJECT: Welcome to Reloop, {userName}!</div>
						</div>

						<div className="flex-1 space-y-3 text-xs text-white/80 leading-relaxed">
							<p className="font-semibold text-white">Hi {userName},</p>
							<p>
								We're thrilled to have you here. You have completed{" "}
								<strong className="text-emerald-400 font-mono">{completedCount} of 3</strong> checklist onboarding steps.
							</p>

							{/* Checklist progress tracker card in email */}
							<div className="bg-slate-900 border border-white/5 p-2.5 rounded-lg space-y-1.5">
								<div className="flex justify-between items-center text-[9px] text-white/40 font-mono">
									<span>SETUP PROGRESS</span>
									<span>{Math.round((completedCount / 3) * 100)}%</span>
								</div>
								<div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-white/5">
									<div 
										className="bg-emerald-500 h-full transition-all duration-300"
										style={{ width: `${(completedCount / 3) * 100}%` }}
									/>
								</div>
							</div>

							{completedCount < 3 ? (
								<div className="w-full bg-emerald-600 py-1.5 rounded text-center text-[9px] font-bold text-white shadow-lg shadow-emerald-600/10 cursor-pointer">
									Complete Your Setup
								</div>
							) : (
								<div className="w-full bg-slate-800 text-slate-400 py-1.5 rounded text-center text-[9px] font-bold border border-white/5">
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
