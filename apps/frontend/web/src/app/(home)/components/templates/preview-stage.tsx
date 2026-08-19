"use client";

import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import { Logo } from "@reloop/ui/logo";
import * as Switch from "@reloop/ui/switch";
import { SdkCodeBlock } from "@reloop/web/app/sdk/components/sdk-code-block";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
	type CSSProperties,
	type RefObject,
	useEffect,
	useRef,
	useState,
} from "react";
import type { TemplateTabId } from "./preview-scenes";
import { PreviewTabs } from "./preview-tabs";

const SEND_OTP_CODE = `import Reloop from 'reloop-email';

const reloop = new Reloop(process.env.RELOOP_API_KEY);

const { data, error } = await reloop.emails.send({
  from: 'Reloop <verify@reloop.sh>',
  to: ['maya@northwind.io'],
  subject: 'Your Reloop login code',
  template: {
    id: 'otp',
    variables: {
      OTP: '842190',
    },
  },
});`;

const TAB_ORDER: TemplateTabId[] = [
	"ai-templates",
	"realtime-editor",
	"version-history",
];

const EASE_DEFAULT: [number, number, number, number] = [0.25, 0.1, 0.25, 1];
const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];
const EASE_MOVE: [number, number, number, number] = [0.77, 0, 0.175, 1];
const SLIDE_PX = 160;
const SLIDE_MS = 0.28;

const DEMO_PROMPT = "generate login code for Reloop";
const EMAIL_HEADING = "Your login code for Reloop.";
const EMAIL_BODY =
	"This link and code will only be valid for the next 5 minutes. If the link does not work, you can use the login verification code directly:";
const EMAIL_FOOTER =
	"If you didn't request this code, you can safely ignore this email.";

type GeneratePhase =
	| "idle"
	| "pending"
	| "generating"
	| "centered"
	| "composed";

type EmailReveal = {
	label: boolean;
	headingChars: number;
	rule: boolean;
	bodyChars: number;
	otp: boolean;
	cta: boolean;
	footer: boolean;
};

const EMAIL_HIDDEN: EmailReveal = {
	label: false,
	headingChars: 0,
	rule: false,
	bodyChars: 0,
	otp: false,
	cta: false,
	footer: false,
};

const EMAIL_FULL: EmailReveal = {
	label: true,
	headingChars: EMAIL_HEADING.length,
	rule: true,
	bodyChars: EMAIL_BODY.length,
	otp: true,
	cta: true,
	footer: true,
};

function wait(ms: number) {
	return new Promise<void>((resolve) => {
		setTimeout(resolve, ms);
	});
}

function typeDelay(char: string) {
	if (char === " ") return 12;
	if (char === "," || char === ".") return 40;
	return 16;
}

function collabTypeDelay(char: string) {
	if (char === " ") return 32;
	if (char === "," || char === "." || char === "—" || char === "-") return 90;
	return 42;
}

const contentVariants = {
	enter: (dir: number) => ({
		opacity: 0,
		x: dir > 0 ? SLIDE_PX : dir < 0 ? -SLIDE_PX : 0,
	}),
	center: {
		opacity: 1,
		x: 0,
	},
	exit: (dir: number) => ({
		opacity: 0,
		x: dir > 0 ? -SLIDE_PX : dir < 0 ? SLIDE_PX : 0,
	}),
};

/* --- Scene 1: AI Email Templates View (send.ts + overlapping OTP email) --- */
function AiTemplatesView() {
	const shouldReduceMotion = useReducedMotion();
	const [phase, setPhase] = useState<GeneratePhase>("idle");
	const [prompt, setPrompt] = useState("");
	const [reveal, setReveal] = useState<EmailReveal>(EMAIL_HIDDEN);
	const userEdited = useRef(false);
	const inputRef = useRef<HTMLInputElement>(null);
	const phaseRef = useRef(phase);
	phaseRef.current = phase;

	const startGenerate = () => {
		if (phaseRef.current !== "idle") return;
		setPhase("pending");
	};
	const startGenerateRef = useRef(startGenerate);
	startGenerateRef.current = startGenerate;

	useEffect(() => {
		if (phase !== "idle") return;
		const timer = window.setTimeout(() => inputRef.current?.focus(), 0);
		return () => window.clearTimeout(timer);
	}, [phase]);

	useEffect(() => {
		if (phase !== "pending") return;
		const timer = window.setTimeout(() => {
			if (shouldReduceMotion) {
				setReveal(EMAIL_FULL);
				setPhase("composed");
				return;
			}
			setReveal(EMAIL_HIDDEN);
			setPhase("generating");
		}, 1000);
		return () => window.clearTimeout(timer);
	}, [phase, shouldReduceMotion]);

	useEffect(() => {
		if (shouldReduceMotion) {
			setPrompt(DEMO_PROMPT);
			return;
		}
		if (phase !== "idle" || userEdited.current) return;
		let index = 0;
		let cancelled = false;
		const tick = async () => {
			await wait(700);
			while (!cancelled && index < DEMO_PROMPT.length) {
				if (userEdited.current) return;
				index += 1;
				setPrompt(DEMO_PROMPT.slice(0, index));
				await wait(DEMO_PROMPT[index - 1] === " " ? 18 : 28);
			}
			if (cancelled || userEdited.current) return;
			await wait(420);
			if (!cancelled && !userEdited.current) startGenerateRef.current();
		};
		void tick();
		return () => {
			cancelled = true;
		};
	}, [phase, shouldReduceMotion]);

	useEffect(() => {
		if (phase !== "generating") return;
		let cancelled = false;
		const run = async () => {
			await wait(220);
			if (cancelled) return;
			setReveal((current) => ({ ...current, label: true }));
			for (let i = 1; i <= EMAIL_HEADING.length; i += 1) {
				if (cancelled) return;
				setReveal((current) => ({ ...current, headingChars: i }));
				await wait(typeDelay(EMAIL_HEADING[i - 1] ?? ""));
			}
			if (cancelled) return;
			setReveal((current) => ({ ...current, rule: true }));
			await wait(90);
			for (let i = 1; i <= EMAIL_BODY.length; i += 1) {
				if (cancelled) return;
				setReveal((current) => ({ ...current, bodyChars: i }));
				await wait(typeDelay(EMAIL_BODY[i - 1] ?? ""));
			}
			if (cancelled) return;
			await wait(140);
			setReveal((current) => ({ ...current, otp: true }));
			await wait(220);
			setReveal((current) => ({ ...current, cta: true, footer: true }));
			await wait(480);
			if (!cancelled) setPhase("centered");
		};
		void run();
		return () => {
			cancelled = true;
		};
	}, [phase]);

	useEffect(() => {
		if (phase !== "centered") return;
		const timer = window.setTimeout(() => setPhase("composed"), 560);
		return () => window.clearTimeout(timer);
	}, [phase]);

	const headingDone = reveal.headingChars >= EMAIL_HEADING.length;
	const bodyDone = reveal.bodyChars >= EMAIL_BODY.length;
	const showSearch =
		phase === "idle" || phase === "pending" || phase === "generating";
	const showEmail =
		phase === "generating" || phase === "centered" || phase === "composed";
	const showCode = phase === "composed";

	return (
		<div className="relative h-full min-h-[25rem] w-full">
			<AnimatePresence>
				{showCode ? (
					<motion.div
						key="send-code"
						initial={
							shouldReduceMotion
								? false
								: { opacity: 0, x: -24, filter: "blur(4px)" }
						}
						animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
						transition={
							shouldReduceMotion
								? { duration: 0 }
								: { duration: 0.5, ease: EASE_OUT, delay: 0.06 }
						}
						className="absolute top-0 left-0 w-full max-w-xl lg:max-w-[34rem]"
					>
						<SdkCodeBlock
							code={SEND_OTP_CODE}
							slug="nodejs"
							lang="typescript"
							path="send.ts"
						/>
					</motion.div>
				) : null}
			</AnimatePresence>

			<div
				className={cn(
					"absolute inset-0 z-10 flex",
					phase === "composed"
						? "items-start justify-end pt-6 pr-0 xl:pr-2"
						: "items-start justify-center pt-2",
				)}
			>
				<AnimatePresence>
					{showEmail ? (
						<motion.div
							key="otp-email"
							layout={!shouldReduceMotion}
							initial={
								shouldReduceMotion ? false : { opacity: 0, y: 14, scale: 0.96 }
							}
							animate={{ opacity: 1, y: 0, scale: 1 }}
							transition={
								shouldReduceMotion
									? { duration: 0 }
									: {
											layout: { duration: 0.55, ease: EASE_MOVE },
											opacity: { duration: 0.32, ease: EASE_OUT },
											y: { duration: 0.4, ease: EASE_OUT },
											scale: { duration: 0.4, ease: EASE_OUT },
										}
							}
							className="w-full max-w-md"
						>
							<div
								className={cn(
									"overflow-hidden rounded-[22px] border border-stroke-soft-200 bg-bg-white-0 p-5 sm:p-6 dark:border-white/10 dark:bg-[#0c0c0e]",
									"shadow-[0_24px_60px_rgba(15,23,42,0.14)] dark:shadow-[0_24px_60px_rgba(0,0,0,0.5)]",
								)}
							>
								<GeneratedOtpEmail
									reveal={reveal}
									headingDone={headingDone}
									bodyDone={bodyDone}
								/>
							</div>
						</motion.div>
					) : null}
				</AnimatePresence>
			</div>

			<AnimatePresence>
				{showSearch ? (
					<motion.form
						key="ai-prompt"
						onSubmit={(event) => {
							event.preventDefault();
							if (!prompt.trim()) return;
							startGenerate();
						}}
						initial={false}
						animate={
							phase === "idle" || phase === "pending"
								? { top: "46%", y: "-50%", opacity: 1 }
								: { top: "100%", y: "calc(-100% - 14px)", opacity: 1 }
						}
						exit={
							shouldReduceMotion
								? { opacity: 0 }
								: { top: "100%", y: "24%", opacity: 0 }
						}
						transition={
							shouldReduceMotion
								? { duration: 0 }
								: { duration: 0.42, ease: EASE_OUT }
						}
						className="-translate-x-1/2 absolute left-1/2 z-30 w-full max-w-md px-1"
					>
						<AiPromptBar
							value={prompt}
							disabled={phase !== "idle"}
							loading={phase === "pending"}
							inputRef={inputRef}
							onChange={(value) => {
								userEdited.current = true;
								setPrompt(value);
							}}
						/>
					</motion.form>
				) : null}
			</AnimatePresence>
		</div>
	);
}

function TypeSlot({
	as: Tag = "p",
	full,
	typed,
	showCaret,
	className,
	style,
}: {
	as?: "p" | "h3";
	full: string;
	typed: string;
	showCaret: boolean;
	className?: string;
	style?: CSSProperties;
}) {
	return (
		<Tag className={cn("relative", className)} style={style}>
			<span className="invisible" aria-hidden>
				{full}
			</span>
			<span className="absolute inset-0">
				{typed}
				{showCaret ? (
					<span className="animate-pulse text-text-strong-950 dark:text-white">
						|
					</span>
				) : null}
			</span>
		</Tag>
	);
}

function GeneratedOtpEmail({
	reveal,
	headingDone,
	bodyDone,
}: {
	reveal: EmailReveal;
	headingDone: boolean;
	bodyDone: boolean;
}) {
	return (
		<>
			<Logo className="-ml-1 mb-4 size-[40px] dark:invert" />

			<p
				className={cn(
					"m-0 font-medium font-mono text-[#707070] text-[11px] uppercase tracking-[0.2em]",
					!reveal.label && "opacity-0",
				)}
			>
				Login Verification
			</p>

			<TypeSlot
				as="h3"
				full={EMAIL_HEADING}
				typed={EMAIL_HEADING.slice(0, reveal.headingChars)}
				showCaret={!headingDone}
				className="mt-2 mb-4 p-0 font-medium text-[#0e0e0e] text-[22px] leading-snug tracking-tight dark:text-white"
				style={{ fontFamily: "Georgia, serif" }}
			/>

			<div
				className={cn(
					"h-px w-full bg-[#e0e0e0] dark:bg-[#222]",
					!reveal.rule && "opacity-0",
				)}
			/>

			<TypeSlot
				full={EMAIL_BODY}
				typed={EMAIL_BODY.slice(0, reveal.bodyChars)}
				showCaret={headingDone && !bodyDone}
				className="mt-4 text-[#555555] text-[15px] leading-[1.6] dark:text-[#b0b0b0]"
			/>

			<div
				className={cn(
					"my-5 rounded-xl border border-stroke-soft-200 bg-bg-weak-50 py-8 text-center dark:border-white/10 dark:bg-white/[0.04]",
					!reveal.otp && "opacity-0",
				)}
			>
				<span className="inline-flex items-center rounded-xl border border-stroke-soft-200 bg-bg-white-0 px-3.5 py-2 font-mono font-semibold text-[18px] text-text-strong-950 tracking-wide dark:border-white/15 dark:bg-[#151518] dark:text-white">
					{"{{{OTP}}}"}
				</span>
				<p className="mt-2.5 mb-0 text-[#707070] text-[11.5px]">
					Valid for 5 minutes · Do not share this code
				</p>
			</div>

			<div className={cn(!reveal.cta && "opacity-0")}>
				<FancyButton.Root
					variant="neutral"
					size="xsmall"
					className="rounded-lg! px-3.5!"
				>
					<span>Login to Reloop</span>
				</FancyButton.Root>
			</div>

			<p
				className={cn(
					"mt-4 text-[#888888] text-[13px] leading-[1.6] dark:text-[#707070]",
					!reveal.footer && "opacity-0",
				)}
			>
				{EMAIL_FOOTER}
			</p>
		</>
	);
}

function AiPromptBar({
	value,
	disabled,
	loading,
	inputRef,
	onChange,
}: {
	value: string;
	disabled: boolean;
	loading: boolean;
	inputRef: RefObject<HTMLInputElement | null>;
	onChange: (value: string) => void;
}) {
	return (
		<div className="flex items-center gap-2 rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-1.5 pl-3 shadow-sm dark:border-white/10 dark:bg-[#0c0c0e]">
			<input
				ref={inputRef}
				value={value}
				disabled={disabled}
				onChange={(event) => onChange(event.target.value)}
				placeholder="generate login code for Reloop"
				aria-label="Generate an email template"
				className="h-7 min-w-0 flex-1 bg-transparent text-[13px] text-text-strong-950 caret-[#FF5722] outline-none placeholder:text-text-soft-400 disabled:opacity-70 dark:text-white dark:caret-[#FF6E40] dark:placeholder:text-white/40"
			/>
			<button
				type="submit"
				disabled={disabled || value.trim().length === 0}
				aria-busy={loading}
				className={cn(
					"flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#FF5722] text-white shadow-xs transition-[transform,opacity] duration-150 ease-out dark:bg-[#FF6E40]",
					loading
						? "opacity-100"
						: "hover:opacity-90 active:scale-[0.97] disabled:opacity-40",
				)}
				title="Send prompt"
			>
				{loading ? (
					<span
						aria-hidden
						className="size-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white"
					/>
				) : (
					<span className="font-bold text-xs">↑</span>
				)}
			</button>
		</div>
	);
}

/* --- Scene 2: Real-time Collaborative Editor View --- */
type CollaboratorId = "maya" | "sarah" | "alex";

interface Collaborator {
	id: CollaboratorId;
	name: string;
	firstName: string;
	initial: string;
	color: string;
	textColor: string;
	highlightBg: string;
	cursorFill: string;
	cursorInk: string;
}

const COLLABORATORS: Record<CollaboratorId, Collaborator> = {
	maya: {
		id: "maya",
		name: "Maya Chen",
		firstName: "Maya",
		initial: "M",
		color: "bg-emerald-500 dark:bg-emerald-500",
		textColor: "text-white",
		highlightBg: "bg-emerald-400/20 dark:bg-emerald-400/20",
		cursorFill: "#10b981",
		cursorInk: "#ffffff",
	},
	sarah: {
		id: "sarah",
		name: "Sarah Jenkins",
		firstName: "Sarah",
		initial: "S",
		color: "bg-amber-400 dark:bg-amber-400",
		textColor: "text-black",
		highlightBg: "bg-amber-300/30 dark:bg-amber-400/25",
		cursorFill: "#facc15",
		cursorInk: "#111111",
	},
	alex: {
		id: "alex",
		name: "Alex Rivera",
		firstName: "Alex",
		initial: "A",
		color: "bg-sky-500 dark:bg-sky-400",
		textColor: "text-white",
		highlightBg: "bg-sky-400/20 dark:bg-sky-400/20",
		cursorFill: "#0ea5e9",
		cursorInk: "#ffffff",
	},
};

const FROM_NAME = "Maya Chen";
const SUBJECT_HEAD = "Introducing Reloop 2.0";
const SUBJECT_TAIL = " — Real-time Email Engine";
const BODY_EDIT =
	"Share a template with your team and watch edits land live — subject lines, variables, and layout blocks stay in sync without a refresh.";

const IDLE_EDITS: Record<CollaboratorId, boolean> = {
	maya: false,
	sarah: false,
	alex: false,
};

/** Presence cursor using the shared `cursor` icon (same SVG as the tab). */
function PresenceCursor({
	user,
	delay = 0,
	emphasized = false,
	className,
}: {
	user: Collaborator;
	delay?: number;
	emphasized?: boolean;
	className?: string;
}) {
	const shouldReduceMotion = useReducedMotion();

	return (
		<motion.div
			aria-hidden
			className={cn("pointer-events-none absolute z-20", className)}
			animate={
				shouldReduceMotion
					? { scale: emphasized ? 1.08 : 1 }
					: {
							x: [0, 6, -3, 5, 0],
							y: [0, -4, 3, -2, 0],
							scale: emphasized ? 1.08 : 1,
						}
			}
			transition={
				shouldReduceMotion
					? { duration: 0.18, ease: EASE_OUT }
					: {
							x: {
								duration: 8.2,
								repeat: Number.POSITIVE_INFINITY,
								ease: EASE_MOVE,
								delay,
							},
							y: {
								duration: 9.4,
								repeat: Number.POSITIVE_INFINITY,
								ease: EASE_MOVE,
								delay: delay + 0.4,
							},
							scale: { duration: 0.18, ease: EASE_OUT },
						}
			}
			style={{ transformOrigin: "2px 2px" }}
		>
			<Icon
				name="cursor"
				className="size-4 drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]"
				style={{ color: user.cursorFill }}
			/>
			<span
				className="absolute top-[14px] left-[12px] whitespace-nowrap rounded-md px-1.5 py-[3px] font-semibold text-[10px] leading-none shadow-[0_1px_2px_rgba(0,0,0,0.18)]"
				style={{ backgroundColor: user.cursorFill, color: user.cursorInk }}
			>
				{user.firstName}
			</span>
		</motion.div>
	);
}

/** Text caret: vertical insertion bar + name flag. Distinct from the mouse cursor. */
function PresenceCaret({
	user,
	blinking = false,
	className,
}: {
	user: Collaborator;
	blinking?: boolean;
	className?: string;
}) {
	const shouldReduceMotion = useReducedMotion();
	const blink = blinking && !shouldReduceMotion;

	return (
		<span
			aria-hidden
			className={cn(
				"relative z-20 mx-px inline-block h-[1.15em] w-0.5 shrink-0 align-text-bottom",
				className,
			)}
		>
			<motion.span
				className="absolute inset-0 rounded-[1px]"
				style={{ backgroundColor: user.cursorFill }}
				animate={{ opacity: blink ? [1, 1, 0, 0] : 1 }}
				transition={
					blink
						? {
								duration: 1.05,
								repeat: Number.POSITIVE_INFINITY,
								ease: "linear",
								times: [0, 0.46, 0.46, 1],
							}
						: { duration: 0.12, ease: EASE_OUT }
				}
			/>
			<span
				className="absolute bottom-full left-0 z-20 mb-px whitespace-nowrap rounded px-1.5 py-[3px] font-semibold text-[10px] leading-none"
				style={{ backgroundColor: user.cursorFill, color: user.cursorInk }}
			>
				{user.firstName}
			</span>
		</span>
	);
}

function RealtimeEditorView() {
	const shouldReduceMotion = useReducedMotion();
	const [activeSpotlight, setActiveSpotlight] = useState<CollaboratorId | null>(
		"sarah",
	);
	const [hoveredUser, setHoveredUser] = useState<CollaboratorId | null>(null);
	const [fromChars, setFromChars] = useState(0);
	const [subjectChars, setSubjectChars] = useState(0);
	const [bodyChars, setBodyChars] = useState(0);
	const [edits, setEdits] = useState(IDLE_EDITS);

	const isSarahActive =
		edits.sarah ||
		activeSpotlight === "sarah" ||
		hoveredUser === "sarah";
	const isAlexActive =
		edits.alex || activeSpotlight === "alex" || hoveredUser === "alex";
	const isMayaActive =
		edits.maya || activeSpotlight === "maya" || hoveredUser === "maya";

	const toggleSpotlight = (id: CollaboratorId) => {
		setActiveSpotlight((prev) => (prev === id ? null : id));
	};

	useEffect(() => {
		if (shouldReduceMotion) {
			setFromChars(FROM_NAME.length);
			setSubjectChars(SUBJECT_HEAD.length);
			setBodyChars(BODY_EDIT.length);
			setEdits(IDLE_EDITS);
			return;
		}

		let cancelled = false;

		const typeText = async (
			text: string,
			setChars: (n: number) => void,
		) => {
			for (let i = 1; i <= text.length; i++) {
				if (cancelled) return;
				setChars(i);
				await wait(collabTypeDelay(text[i - 1]!));
			}
		};

		const mark = (id: CollaboratorId, on: boolean) => {
			if (cancelled) return;
			setEdits((prev) => (prev[id] === on ? prev : { ...prev, [id]: on }));
		};

		const play = async () => {
			while (!cancelled) {
				setFromChars(0);
				setSubjectChars(0);
				setBodyChars(0);
				setEdits(IDLE_EDITS);
				await wait(420);
				if (cancelled) return;

				mark("alex", true);
				const alex = typeText(FROM_NAME, setFromChars).then(() =>
					mark("alex", false),
				);

				await wait(360);
				if (cancelled) return;
				mark("sarah", true);
				const sarah = typeText(SUBJECT_HEAD, setSubjectChars).then(() =>
					mark("sarah", false),
				);

				await wait(480);
				if (cancelled) return;
				mark("maya", true);
				const maya = typeText(BODY_EDIT, setBodyChars).then(() =>
					mark("maya", false),
				);

				await Promise.all([alex, sarah, maya]);
				if (cancelled) return;
				await wait(2600);
			}
		};

		void play();
		return () => {
			cancelled = true;
		};
	}, [shouldReduceMotion]);

	return (
		<div className="relative mx-auto w-full max-w-3xl overflow-hidden rounded-2xl border border-stroke-soft-200 bg-bg-white-0 shadow-xs dark:border-white/10 dark:bg-[#0c0c0e]">
			<PresenceCursor
				user={COLLABORATORS.sarah}
				delay={0.2}
				emphasized={isSarahActive}
				className="top-[9.6rem] left-[42%] sm:top-[9.8rem] sm:left-[44%]"
			/>
			<PresenceCursor
				user={COLLABORATORS.alex}
				delay={1.1}
				emphasized={isAlexActive}
				className="top-[4.6rem] left-[28%] sm:left-[30%]"
			/>
			<PresenceCursor
				user={COLLABORATORS.maya}
				delay={2.4}
				emphasized={isMayaActive}
				className="top-[17.5rem] left-[18%] sm:top-[18rem] sm:left-[22%]"
			/>

			{/* Top Bar with Document Title & Multiplayer Avatars */}
			<div className="flex items-center justify-between border-stroke-soft-100 border-b px-4 py-2.5 dark:border-white/10">
				<div className="flex items-center gap-2">
					<span className="font-semibold text-text-strong-950 text-xs tracking-tight dark:text-white">
						Reloop 2.0: Developer Preview
					</span>
				</div>

				{/* Clickable Avatars with Figma-style Spotlight */}
				<div className="flex items-center gap-2">
					<div className="-space-x-2 flex">
						{(["maya", "sarah", "alex"] as CollaboratorId[]).map(
							(id, index) => {
								const user = COLLABORATORS[id];

								return (
									<button
										key={id}
										type="button"
										onClick={() => toggleSpotlight(id)}
										onMouseEnter={() => setHoveredUser(id)}
										onMouseLeave={() => setHoveredUser(null)}
										title={`Click to spotlight ${user.name}`}
										style={{ zIndex: index }}
										className={cn(
											"relative flex size-6 cursor-pointer items-center justify-center rounded-full font-bold text-[10px] ring-2 ring-white hover:z-10 dark:ring-[#0c0c0e]",
											user.color,
											user.textColor,
										)}
									>
										{user.initial}
									</button>
								);
							},
						)}
					</div>

					<div className="flex items-center gap-1 text-[10px] text-text-soft-400 dark:text-white/40">
						<span className="size-1.5 rounded-full bg-emerald-500" />
						<span>3 editing</span>
					</div>
				</div>
			</div>

			{/* Document Header Fields (From, To, Subject) */}
			<div className="space-y-2 border-stroke-soft-100 border-b p-4 text-xs sm:px-6 dark:border-white/5">
				{/* From Row with Alex's caret */}
				<div className="flex items-center justify-between text-text-sub-600 dark:text-white/70">
					<div className="flex items-center gap-3">
						<span className="w-10 text-text-soft-400 dark:text-white/40">
							From
						</span>
						<div
							onMouseEnter={() => setHoveredUser("alex")}
							onMouseLeave={() => setHoveredUser(null)}
							className={cn(
								"relative inline-flex items-center rounded-xs font-mono text-[11px] text-text-strong-950 transition-colors dark:text-white",
								isAlexActive && COLLABORATORS.alex.highlightBg,
							)}
						>
							<span>{FROM_NAME.slice(0, fromChars)}</span>
							<PresenceCaret
								user={COLLABORATORS.alex}
								blinking={edits.alex}
							/>
							<span className="text-text-soft-400 dark:text-white/40">
								&lt;maya@updates.reloop.sh&gt;
							</span>
						</div>
					</div>
					<span className="text-[10.5px] text-text-soft-400 dark:text-white/40">
						Reply-To
					</span>
				</div>

				{/* To Row with Maya's Badge */}
				<div className="flex items-center justify-between text-text-sub-600 dark:text-white/70">
					<div className="flex items-center gap-3">
						<span className="w-10 text-text-soft-400 dark:text-white/40">
							To
						</span>
						<div
							onMouseEnter={() => setHoveredUser("maya")}
							onMouseLeave={() => setHoveredUser(null)}
							className="relative inline-flex items-center"
						>
							<span className="rounded bg-bg-weak-50 px-2 py-0.5 font-mono text-[10.5px] text-text-strong-950 dark:bg-white/10 dark:text-white">
								Early Access Developers ×
							</span>
						</div>
					</div>
					<span className="text-[10.5px] text-text-soft-400 dark:text-white/40">
						When
					</span>
				</div>

				{/* Subject Row with Sarah's caret */}
				<div className="flex items-center justify-between text-text-sub-600 dark:text-white/70">
					<div className="flex items-center gap-3">
						<span className="w-10 text-text-soft-400 dark:text-white/40">
							Subject
						</span>
						<div
							onMouseEnter={() => setHoveredUser("sarah")}
							onMouseLeave={() => setHoveredUser(null)}
							className={cn(
								"relative inline-flex items-center rounded-xs font-medium text-[11.5px] text-text-strong-950 transition-colors dark:text-white",
								isSarahActive && COLLABORATORS.sarah.highlightBg,
							)}
						>
							<span>{SUBJECT_HEAD.slice(0, subjectChars)}</span>
							<PresenceCaret
								user={COLLABORATORS.sarah}
								blinking={edits.sarah}
							/>
							{subjectChars === SUBJECT_HEAD.length ? (
								<span className="text-text-sub-600 dark:text-white/70">
									{SUBJECT_TAIL}
								</span>
							) : null}
						</div>
					</div>
					<span className="text-[10.5px] text-text-soft-400 dark:text-white/40">
						Preview text
					</span>
				</div>
			</div>

			{/* Main Email Content Body */}
			<div className="space-y-3.5 p-5 text-left sm:p-6">
				<div className="relative inline-flex items-center text-text-strong-950 text-xs dark:text-white">
					<span>Hey developers,</span>
				</div>

				{/* Main Paragraph */}
				<p className="text-[11.5px] text-text-sub-600 leading-relaxed dark:text-white/80">
					Today we're launching the next evolution of transactional and
					marketing email. Build with React Email, track deliverability in
					real-time, and collaborate with your entire team in one unified
					canvas.
				</p>

				{/* Primary Button with Reloop UI FancyButton */}
				<div className="pt-1">
					<FancyButton.Root
						variant="neutral"
						size="xsmall"
						className="rounded-lg! px-3.5!"
					>
						<span>Deploy to Production →</span>
					</FancyButton.Root>
				</div>

				{/* Section Header & Subtitle */}
				<div className="space-y-1.5 border-stroke-soft-100 border-t pt-3 dark:border-white/5">
					<h4 className="font-bold text-sm text-text-strong-950 tracking-tight dark:text-white">
						What's new in Reloop 2.0?
					</h4>
					<p className="text-[11px] text-text-sub-600 leading-relaxed dark:text-white/70">
						Type-safe component primitives, multiplayer canvas editing, and
						automated deliverability monitoring right out of the box.
					</p>
					<p
						onMouseEnter={() => setHoveredUser("maya")}
						onMouseLeave={() => setHoveredUser(null)}
						className={cn(
							"text-[11px] text-text-sub-600 leading-relaxed transition-colors dark:text-white/70",
							isMayaActive && COLLABORATORS.maya.highlightBg,
						)}
					>
						{BODY_EDIT.slice(0, bodyChars)}
						<PresenceCaret
							user={COLLABORATORS.maya}
							blinking={edits.maya}
						/>
					</p>
					<p className="text-[11px] text-text-sub-600 leading-relaxed dark:text-white/70">
						Every send still goes through the same React Email pipeline, so what
						you preview is what lands in the inbox. Reply to this email if you
						want a walkthrough of the new editor, or jump in from the dashboard
						and open any template to try it.
					</p>
					<p className="text-[11px] text-text-sub-600 leading-relaxed dark:text-white/70">
						— Maya, on behalf of Reloop
					</p>
				</div>
			</div>
		</div>
	);
}

/* --- Scene 3: Version History View (Single Focused Widget Block) --- */
function VersionHistoryView() {
	const [showChanges, setShowChanges] = useState(true);
	const [selectedVersion, setSelectedVersion] = useState("v1");

	const VERSIONS = [
		{
			id: "v1",
			time: "11:12:10",
			title: "Button Block was added",
			author: "Maya Chen",
			authorColor: "bg-emerald-500",
			changes: "12 Changes",
			icon: "modules" as const,
		},
		{
			id: "v2",
			time: "11:12:08",
			title: "Subject Line updated",
			author: "Sarah Jenkins",
			authorColor: "bg-amber-400",
			changes: "2 Changes",
			icon: "file-code" as const,
		},
		{
			id: "v3",
			time: "11:12:05",
			title: "Header props modified",
			author: "Alex Rivera",
			authorColor: "bg-sky-500",
			changes: "4 Changes",
			icon: "user" as const,
		},
		{
			id: "v4",
			time: "11:12:02",
			title: "Greeting & Intro tuned",
			author: "Noah Patel",
			authorColor: "bg-indigo-500",
			changes: "6 Changes",
			icon: "sparkling" as const,
		},
		{
			id: "v5",
			time: "11:11:59",
			title: "Template scaffold created",
			author: "Maya Chen",
			authorColor: "bg-emerald-500",
			changes: "Initial",
			icon: "layout" as const,
		},
	];

	return (
		<div className="relative mx-auto w-full max-w-xl">
			{/* Top Bar with Logo & Restore Button */}
			<div className="mb-3 flex items-center justify-between">
				<div className="flex items-center gap-2">
					<div className="flex size-7 items-center justify-center rounded-lg border border-stroke-soft-200 bg-bg-white-0 shadow-2xs dark:border-white/10 dark:bg-white/5">
						<Icon
							name="sparkling"
							className="size-3.5 text-text-strong-950 dark:text-white"
						/>
					</div>
					<button
						type="button"
						className="flex size-7 items-center justify-center rounded-lg border border-stroke-soft-200 bg-bg-white-0 text-text-sub-600 shadow-2xs transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 dark:border-white/10 dark:bg-white/5 dark:text-white/70 dark:hover:bg-white/10"
					>
						<span className="text-xs">←</span>
					</button>
				</div>

				{/* Signature Reloop UI FancyButton Root */}
				<FancyButton.Root
					variant="neutral"
					size="xsmall"
					className="rounded-full! px-3.5!"
				>
					<Icon name="history" className="size-3" />
					<span>Restore this version</span>
				</FancyButton.Root>
			</div>

			{/* Main Single Block: Version History Widget */}
			<div className="relative overflow-visible rounded-2xl border border-stroke-soft-200 bg-bg-white-0 shadow-sm dark:border-white/10 dark:bg-[#0c0c0e]">
				{/* Card Header */}
				<div className="flex items-center justify-between border-stroke-soft-100 border-b px-5 py-3 dark:border-white/10">
					<h3 className="font-medium text-text-strong-950 text-xs tracking-tight dark:text-white">
						Version History
					</h3>
					<span className="text-text-soft-400 text-xs dark:text-white/40">
						🔍
					</span>
				</div>

				{/* Timeline Content */}
				<div className="relative p-4 sm:p-5">
					<div className="mb-2 font-normal text-[11px] text-text-soft-400 dark:text-white/40">
						Today
					</div>

					{/* Vertical Timeline Rail & Items */}
					<div className="relative space-y-1.5">
						{/* Vertical Connecting Line */}
						<div className="absolute top-3 bottom-3 left-[15px] w-px bg-stroke-soft-200 dark:bg-white/10" />

						{VERSIONS.map((v) => {
							const isSelected = selectedVersion === v.id;

							return (
								<div key={v.id} className="relative flex items-center gap-3">
									{/* Timeline Icon Node */}
									<div
										className={cn(
											"relative z-10 flex size-8 shrink-0 items-center justify-center rounded-lg border text-xs transition-colors",
											isSelected
												? "border-stroke-soft-300 bg-bg-weak-50 text-text-strong-950 dark:border-white/20 dark:bg-white/10 dark:text-white"
												: "border-stroke-soft-200 bg-bg-white-0 text-text-sub-600 dark:border-white/10 dark:bg-[#121215] dark:text-white/60",
										)}
									>
										<Icon name={v.icon} className="size-3.5" />
									</div>

									{/* Snapshot Card */}
									<div
										onClick={() => setSelectedVersion(v.id)}
										className={cn(
											"group flex flex-1 cursor-pointer items-center justify-between rounded-xl border p-2.5 transition-all",
											isSelected
												? "border-stroke-soft-200 bg-bg-weak-50/60 shadow-2xs dark:border-white/10 dark:bg-white/[0.02]"
												: "border-transparent bg-transparent hover:border-stroke-soft-200 hover:bg-bg-weak-50/50 dark:hover:border-white/10 dark:hover:bg-white/[0.02]",
										)}
									>
										<div className="space-y-0.5">
											<div className="flex items-center gap-2">
												<span className="font-mono text-[10.5px] text-text-soft-400 dark:text-white/40">
													{v.time}
												</span>
												<span className="font-normal text-text-strong-950 text-xs dark:text-white">
													{v.title}
												</span>
											</div>
											<div className="flex items-center gap-1.5 text-[10.5px]">
												<span
													className={cn("size-1.5 rounded-full", v.authorColor)}
												/>
												<span className="text-text-sub-600 dark:text-white/60">
													{v.author}
												</span>
												<span className="text-text-soft-400 dark:text-white/30">
													·
												</span>
												<span className="text-text-soft-400 dark:text-white/50">
													{v.changes} {isSelected && "▾"}
												</span>
											</div>
										</div>

										<span className="text-text-soft-400 text-xs opacity-0 transition-opacity group-hover:opacity-100 dark:text-white/40">
											•••
										</span>
									</div>
								</div>
							);
						})}

						{/* Floating Action Menu Popover */}
						<div className="-right-4 absolute top-2 z-30 hidden w-44 rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-1.5 shadow-xl sm:block dark:border-white/15 dark:bg-[#151518]">
							<div className="space-y-0.5 text-[11px]">
								<FancyButton.Root
									variant="neutral"
									size="xsmall"
									className="w-full justify-start rounded-lg! px-2.5! font-normal"
								>
									<Icon name="history" className="size-3" />
									<span>Restore</span>
								</FancyButton.Root>
								{[
									{ label: "Restore as new", badge: "Soon" },
									{ label: "Preview snapshot", badge: "Soon" },
									{ label: "Add a Name", badge: "Soon" },
									{ label: "Add a Tag", badge: "Soon" },
									{ label: "Export React Email", badge: "Soon" },
								].map((item) => (
									<div
										key={item.label}
										className="flex cursor-pointer items-center justify-between rounded-lg px-2.5 py-1.5 font-normal text-text-sub-600 hover:bg-bg-weak-50 hover:text-text-strong-950 dark:text-white/70 dark:hover:bg-white/5 dark:hover:text-white"
									>
										<span>{item.label}</span>
										<span className="rounded border border-stroke-soft-200 bg-bg-weak-50 px-1.5 py-0.2 font-medium text-[8.5px] text-text-soft-400 dark:border-white/10 dark:bg-white/5 dark:text-white/40">
											{item.badge}
										</span>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>

				{/* Card Footer with Reloop UI Switch */}
				<div className="flex items-center justify-between border-stroke-soft-100 border-t px-5 py-3 dark:border-white/10">
					<span className="font-medium text-text-sub-600 text-xs dark:text-white/70">
						Show Changes
					</span>
					<Switch.Root checked={showChanges} onCheckedChange={setShowChanges} />
				</div>
			</div>
		</div>
	);
}

/* --- Main PreviewStage Component --- */
export function PreviewStage() {
	const shouldReduceMotion = useReducedMotion();
	const [active, setActive] = useState<TemplateTabId>("ai-templates");
	const [direction, setDirection] = useState(0);

	const handleTabChange = (newTab: TemplateTabId) => {
		if (newTab === active) return;
		const from = TAB_ORDER.indexOf(active);
		const to = TAB_ORDER.indexOf(newTab);
		if (from !== -1 && to !== -1) {
			setDirection(to > from ? 1 : -1);
		} else {
			setDirection(0);
		}
		setActive(newTab);
	};

	return (
		<div className="bg-bg-white-0 dark:bg-black">
			<div className="relative overflow-hidden">
				<div className="relative mx-auto h-[29rem] max-w-5xl px-5 pt-6 sm:h-[32rem] sm:px-8 sm:pt-7 lg:h-[34rem] lg:px-10 lg:pt-8">
					<AnimatePresence initial={false} custom={direction} mode="popLayout">
						<motion.div
							key={active}
							custom={direction}
							variants={contentVariants}
							initial={shouldReduceMotion ? false : "enter"}
							animate="center"
							exit={shouldReduceMotion ? undefined : "exit"}
							transition={
								shouldReduceMotion
									? { duration: 0 }
									: { duration: SLIDE_MS, ease: EASE_DEFAULT }
							}
							className="relative h-full w-full"
						>
							{active === "ai-templates" ? (
								<AiTemplatesView />
							) : active === "realtime-editor" ? (
								<RealtimeEditorView />
							) : (
								<VersionHistoryView />
							)}
						</motion.div>
					</AnimatePresence>
				</div>
				<div
					aria-hidden
					className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-44 bg-gradient-to-t from-15% from-[#fbfbfb] via-[#fbfbfb]/80 to-transparent dark:from-[#0a0a0a] dark:via-[#0a0a0a]/80"
				/>
			</div>
			<PreviewTabs active={active} onChange={handleTabChange} />
		</div>
	);
}
