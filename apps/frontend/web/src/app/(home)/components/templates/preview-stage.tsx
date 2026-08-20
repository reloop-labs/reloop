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
		<div className="flex items-center gap-2 rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-1.5 pl-3 dark:border-white/10 dark:bg-[#0c0c0e]">
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
const LAUNCH_SECTION =
	"We closed the quarter with the multiplayer editor in production. Customers now write and ship investor notes, receipts, and product emails in one file — copy, from-line, and CTA — without a handoff.";
const BODY_EDIT =
	"New logos came in through the product, not outbound. Most of them started on a template, invited a teammate, and sent from their own domain the same week.";

type CursorPhase = "hidden" | "arrive" | "click" | "park";

type FieldState = {
	cursor: CursorPhase;
	caret: boolean;
	typing: boolean;
	parkX: number;
	parkY: number;
};

const FIELD_IDLE: FieldState = {
	cursor: "hidden",
	caret: false,
	typing: false,
	parkX: 0,
	parkY: 0,
};

const CURSOR_START = { x: -22, y: -18, scale: 0.96, opacity: 0 };
const CURSOR_CLICK = { x: 0, y: 0, scale: 0.82, opacity: 1 };
const CURSOR_ON_TARGET = { x: 0, y: 0, scale: 1, opacity: 1 };

/** Different sides of the mail so they never stack in one cluster. */
const CURSOR_PARK_BASE: Record<CollaboratorId, { x: number; y: number }> = {
	alex: { x: -148, y: -44 },
	sarah: { x: 328, y: 18 },
	maya: { x: 196, y: 56 },
};

function scatterPark(id: CollaboratorId) {
	const base = CURSOR_PARK_BASE[id];
	return {
		parkX: Math.round(base.x + (Math.random() - 0.5) * 64),
		parkY: Math.round(base.y + (Math.random() - 0.5) * 48),
	};
}

function fieldDone(id: CollaboratorId): FieldState {
	const park = CURSOR_PARK_BASE[id];
	return {
		cursor: "park",
		caret: true,
		typing: false,
		parkX: park.x,
		parkY: park.y,
	};
}

/** Presence cursor using the shared `cursor` icon (same SVG as the tab). */
function PresenceCursor({
	user,
	phase,
	parkX,
	parkY,
}: {
	user: Collaborator;
	phase: Exclude<CursorPhase, "hidden">;
	parkX: number;
	parkY: number;
}) {
	const shouldReduceMotion = useReducedMotion();

	const pose =
		phase === "click"
			? CURSOR_CLICK
			: phase === "park"
				? { x: parkX, y: parkY, scale: 1, opacity: 1 }
				: CURSOR_ON_TARGET;

	return (
		<motion.div
			aria-hidden
			className="pointer-events-none absolute top-0 left-0 z-30"
			initial={shouldReduceMotion ? false : CURSOR_START}
			animate={pose}
			transition={
				shouldReduceMotion
					? { duration: 0 }
					: phase === "arrive"
						? { duration: 0.42, ease: EASE_MOVE }
						: phase === "park"
							? { duration: 0.34, ease: EASE_MOVE }
							: { duration: 0.1, ease: EASE_OUT }
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

function FieldCaret({
	user,
	show,
	blinking,
}: {
	user: Collaborator;
	show: boolean;
	blinking: boolean;
}) {
	return (
		<AnimatePresence>
			{show ? (
				<PresenceCaret
					key={`${user.id}-caret`}
					user={user}
					blinking={blinking}
				/>
			) : null}
		</AnimatePresence>
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
		<motion.span
			aria-hidden
			initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.95, y: 2 }}
			animate={{ opacity: 1, scale: 1, y: 0 }}
			exit={shouldReduceMotion ? undefined : { opacity: 0, scale: 0.97, y: 1 }}
			transition={{
				duration: shouldReduceMotion ? 0 : 0.16,
				ease: EASE_OUT,
			}}
			className={cn(
				"relative z-20 mx-px inline-block h-[1.15em] w-0.5 shrink-0 origin-bottom align-text-bottom",
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
		</motion.span>
	);
}

function RealtimeEditorView() {
	const shouldReduceMotion = useReducedMotion();
	const [activeSpotlight, setActiveSpotlight] = useState<CollaboratorId | null>(
		"sarah",
	);
	const [hoveredUser, setHoveredUser] = useState<CollaboratorId | null>(null);
	const [fromChars, setFromChars] = useState(0);
	const [launchChars, setLaunchChars] = useState(0);
	const [bodyChars, setBodyChars] = useState(0);
	const [fields, setFields] = useState<Record<CollaboratorId, FieldState>>({
		maya: FIELD_IDLE,
		sarah: FIELD_IDLE,
		alex: FIELD_IDLE,
	});
	const [focusedField, setFocusedField] = useState<CollaboratorId | null>(null);

	const isSarahActive =
		fields.sarah.caret ||
		focusedField === "sarah" ||
		activeSpotlight === "sarah" ||
		hoveredUser === "sarah";
	const isAlexActive =
		fields.alex.caret ||
		focusedField === "alex" ||
		activeSpotlight === "alex" ||
		hoveredUser === "alex";
	const isMayaActive =
		fields.maya.caret ||
		focusedField === "maya" ||
		activeSpotlight === "maya" ||
		hoveredUser === "maya";

	const focusField = (id: CollaboratorId) => {
		setFocusedField(id);
		setActiveSpotlight(id);
		setFields((prev) => ({
			...prev,
			[id]: {
				...prev[id],
				caret: true,
				cursor: prev[id].cursor === "hidden" ? "park" : prev[id].cursor,
				...(prev[id].cursor === "hidden" ? scatterPark(id) : null),
			},
		}));
	};

	const toggleSpotlight = (id: CollaboratorId) => {
		setActiveSpotlight((prev) => (prev === id ? null : id));
		focusField(id);
	};

	useEffect(() => {
		if (shouldReduceMotion) {
			setFromChars(FROM_NAME.length);
			setLaunchChars(LAUNCH_SECTION.length);
			setBodyChars(BODY_EDIT.length);
			setFields({
				maya: fieldDone("maya"),
				sarah: fieldDone("sarah"),
				alex: fieldDone("alex"),
			});
			return;
		}

		let cancelled = false;

		const typeText = async (text: string, setChars: (n: number) => void) => {
			for (let i = 1; i <= text.length; i++) {
				if (cancelled) return;
				setChars(i);
				await wait(collabTypeDelay(text[i - 1]!));
			}
		};

		const patch = (id: CollaboratorId, next: Partial<FieldState>) => {
			if (cancelled) return;
			setFields((prev) => ({ ...prev, [id]: { ...prev[id], ...next } }));
		};

		const runField = async (
			id: CollaboratorId,
			text: string,
			setChars: (n: number) => void,
		) => {
			patch(id, { cursor: "arrive", caret: false, typing: false });
			await wait(440);
			if (cancelled) return;
			patch(id, { cursor: "click" });
			await wait(200);
			if (cancelled) return;
			patch(id, { caret: true });
			await wait(140);
			if (cancelled) return;
			patch(id, { cursor: "park", ...scatterPark(id) });
			await wait(320);
			if (cancelled) return;
			patch(id, { typing: true });
			await typeText(text, setChars);
			if (cancelled) return;
			patch(id, { typing: false, caret: true, cursor: "park" });
		};

		const play = async () => {
			await wait(360);
			if (cancelled) return;
			const alex = runField("alex", FROM_NAME, setFromChars);
			await wait(560);
			if (cancelled) return;
			const sarah = runField("sarah", LAUNCH_SECTION, setLaunchChars);
			await wait(900);
			if (cancelled) return;
			const maya = runField("maya", BODY_EDIT, setBodyChars);
			await Promise.all([alex, sarah, maya]);
		};

		void play();
		return () => {
			cancelled = true;
		};
	}, [shouldReduceMotion]);

	return (
		<div className="relative mx-auto w-full max-w-3xl overflow-visible rounded-2xl border border-stroke-soft-200 bg-bg-white-0 shadow-xs dark:border-white/10 dark:bg-[#0c0c0e]">
			{/* Top Bar with Document Title & Multiplayer Avatars */}
			<div className="flex items-center justify-between border-stroke-soft-100 px-4 py-2.5 dark:border-white/10">
				<div className="flex items-center gap-2">
					<span className="font-semibold text-text-strong-950 text-xs tracking-tight dark:text-white">
						investor-update · Q3
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
			<div className="space-y-2 border-stroke-soft-100 p-4 text-xs sm:px-6 dark:border-white/5">
				{/* From Row with Alex's caret */}
				<div className="flex items-center justify-between text-text-sub-600 dark:text-white/70">
					<div className="flex items-center gap-3">
						<span className="w-10 text-text-soft-400 dark:text-white/40">
							From
						</span>
						<div
							onClick={() => focusField("alex")}
							onMouseEnter={() => setHoveredUser("alex")}
							onMouseLeave={() => setHoveredUser(null)}
							className={cn(
								"relative inline-flex cursor-text items-center rounded-xs font-mono text-[11px] text-text-strong-950 transition-colors dark:text-white",
								isAlexActive && COLLABORATORS.alex.highlightBg,
							)}
						>
							{fields.alex.cursor !== "hidden" ? (
								<PresenceCursor
									user={COLLABORATORS.alex}
									phase={fields.alex.cursor}
									parkX={fields.alex.parkX}
									parkY={fields.alex.parkY}
								/>
							) : null}
							<span>{FROM_NAME.slice(0, fromChars)}</span>
							<FieldCaret
								user={COLLABORATORS.alex}
								show={fields.alex.caret || focusedField === "alex"}
								blinking={fields.alex.typing}
							/>
							<span className="text-text-soft-400 dark:text-white/40">
								&lt;maya@reloop.sh&gt;
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
								Reloop investors ×
							</span>
						</div>
					</div>
					<span className="text-[10.5px] text-text-soft-400 dark:text-white/40">
						When
					</span>
				</div>

				<div className="flex items-center justify-between text-text-sub-600 dark:text-white/70">
					<div className="flex items-center gap-3">
						<span className="w-10 text-text-soft-400 dark:text-white/40">
							Subject
						</span>
						<div className="relative inline-flex items-center font-medium text-[11.5px] text-text-strong-950 dark:text-white">
							<span>Q3 note from Reloop</span>
							<span className="text-text-sub-600 dark:text-white/70">
								{" "}
								— the editor is live
							</span>
						</div>
					</div>
					<span className="text-[10.5px] text-text-soft-400 dark:text-white/40">
						Preview text
					</span>
				</div>
			</div>

			{/* Main Email Content Body */}
			<div className="space-y-3.5 p-5 text-left sm:p-6">
				<div
					onClick={() => focusField("sarah")}
					onMouseEnter={() => setHoveredUser("sarah")}
					onMouseLeave={() => setHoveredUser(null)}
					className={cn(
						"cursor-text space-y-3.5 rounded-xs transition-colors",
						isSarahActive && COLLABORATORS.sarah.highlightBg,
					)}
				>
					<div className="relative inline-flex items-center text-text-strong-950 text-xs dark:text-white">
						<span>Dear investors,</span>
					</div>
					<p className="relative min-h-[1.2em] text-[11.5px] text-text-sub-600 leading-relaxed dark:text-white/80">
						{fields.sarah.cursor !== "hidden" ? (
							<PresenceCursor
								user={COLLABORATORS.sarah}
								phase={fields.sarah.cursor}
								parkX={fields.sarah.parkX}
								parkY={fields.sarah.parkY}
							/>
						) : null}
						{LAUNCH_SECTION.slice(0, launchChars)}
						<FieldCaret
							user={COLLABORATORS.sarah}
							show={fields.sarah.caret || focusedField === "sarah"}
							blinking={fields.sarah.typing}
						/>
					</p>
					<p className="text-[11.5px] text-text-sub-600 leading-relaxed dark:text-white/80">
						That was the bet in the last note: teams should write email the way
						they write product. This quarter we put that file in production and
						started charging for it.
					</p>
				</div>

				{/* Section Header & Subtitle */}
				<div className="space-y-3 border-stroke-soft-100 border-t pt-3 dark:border-white/5">
					<div className="space-y-1.5">
						<h4 className="font-bold text-sm text-text-strong-950 tracking-tight dark:text-white">
							This quarter
						</h4>
						<p className="text-[11px] text-text-sub-600 leading-relaxed dark:text-white/70">
							Editor in production. Self-serve up. Time-to-first-email down.
						</p>
						<p
							onClick={() => focusField("maya")}
							onMouseEnter={() => setHoveredUser("maya")}
							onMouseLeave={() => setHoveredUser(null)}
							className={cn(
								"relative min-h-[1.2em] cursor-text text-[11px] text-text-sub-600 leading-relaxed transition-colors dark:text-white/70",
								isMayaActive && COLLABORATORS.maya.highlightBg,
							)}
						>
							{fields.maya.cursor !== "hidden" ? (
								<PresenceCursor
									user={COLLABORATORS.maya}
									phase={fields.maya.cursor}
									parkX={fields.maya.parkX}
									parkY={fields.maya.parkY}
								/>
							) : null}
							{BODY_EDIT.slice(0, bodyChars)}
							<FieldCaret
								user={COLLABORATORS.maya}
								show={fields.maya.caret || focusedField === "maya"}
								blinking={fields.maya.typing}
							/>
						</p>
					</div>
					<div className="space-y-1.5">
						<h4 className="font-bold text-sm text-text-strong-950 tracking-tight dark:text-white">
							Where we are focused
						</h4>
						<p className="text-[11px] text-text-sub-600 leading-relaxed dark:text-white/70">
							Deliverability still leads every conversation. We added domain
							health in the dashboard and a clearer path from first API key to a
							signed domain. That is the loop we will keep tightening.
						</p>
						<p className="text-[11px] text-text-sub-600 leading-relaxed dark:text-white/70">
							On the product side: version history, shared templates, and the
							live editor you are looking at. The goal is one canvas for copy,
							code, and send — not a Google Doc plus a ticket plus a deploy.
						</p>
					</div>
					<p className="text-[11px] text-text-sub-600 leading-relaxed dark:text-white/70">
						If you want the full metrics pack, it is in the same folder as this
						note. We will send the next update after close of Q4.
					</p>
					<p className="text-[11px] text-text-sub-600 leading-relaxed dark:text-white/70">
						— Maya, Reloop
					</p>
				</div>
			</div>
		</div>
	);
}

/* --- Scene 3: Version History View (Interactive with Cursor & Restore) --- */
const HISTORY_ITEMS = [
	{
		id: "v6",
		version: "v6",
		title: "Opened investor Q3 note",
		author: "Maya Chen",
		initial: "M",
		avatar: "bg-emerald-500 text-white",
		timestamp: "1 hour ago",
	},
	{
		id: "v5",
		version: "v5",
		title: "Subject: the editor is live",
		author: "Sarah Jenkins",
		initial: "S",
		avatar: "bg-amber-400 text-black",
		timestamp: "3 hours ago",
	},
	{
		id: "v4",
		version: "v4",
		title: "From-line set to Maya Chen",
		author: "Alex Rivera",
		initial: "A",
		avatar: "bg-sky-500 text-white",
		timestamp: "5 hours ago",
	},
	{
		id: "v3",
		version: "v3",
		title: "Added this-quarter metrics",
		author: "Maya Chen",
		initial: "M",
		avatar: "bg-emerald-500 text-white",
		timestamp: "Yesterday",
	},
	{
		id: "v2",
		version: "v2",
		title: "First draft of the investor note",
		author: "Sarah Jenkins",
		initial: "S",
		avatar: "bg-amber-400 text-black",
		timestamp: "2 days ago",
	},
	{
		id: "v1",
		version: "v1",
		title: "Template scaffold for the Q3 note",
		author: "Alex Rivera",
		initial: "A",
		avatar: "bg-sky-500 text-white",
		timestamp: "4 days ago",
	},
	{
		id: "v0",
		version: "v0",
		title: "Outline: traction, focus, ask",
		author: "Maya Chen",
		initial: "M",
		avatar: "bg-emerald-500 text-white",
		timestamp: "Last week",
	},
] as const;

function RestoreIcon({ className }: { className?: string }) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 12 12"
			fill="none"
			aria-hidden
			className={className}
		>
			<path
				d="m1.282,3.694C2.136,1.951,3.928.75,6,.75c2.899,0,5.25,2.351,5.25,5.25"
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="1.5"
			/>
			<polyline
				points="4.25 3.75 1.25 3.75 1.25 .75"
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="1.5"
			/>
			<circle cx="6" cy="11.25" r=".75" fill="currentColor" />
			<circle cx="3.375" cy="10.547" r=".75" fill="currentColor" />
			<circle cx="1.453" cy="8.625" r=".75" fill="currentColor" />
			<circle cx="8.625" cy="10.547" r=".75" fill="currentColor" />
			<circle cx="10.547" cy="8.625" r=".75" fill="currentColor" />
		</svg>
	);
}

function VersionHistoryView() {
	const shouldReduceMotion = useReducedMotion();
	const rootRef = useRef<HTMLDivElement>(null);
	const rowRefs = useRef<Record<string, HTMLDivElement | null>>({});
	const restoreRefs = useRef<Record<string, HTMLButtonElement | null>>({});
	const [currentId, setCurrentId] = useState("v6");
	const [selectedId, setSelectedId] = useState("v6");
	const [hoveredId, setHoveredId] = useState<string | null>(null);
	const [toast, setToast] = useState<string | null>(null);
	const [isUserInteracting, setIsUserInteracting] = useState(false);
	const [cursorPos, setCursorPos] = useState({ x: 48, y: 72 });
	const [cursorVisible, setCursorVisible] = useState(true);

	const restore = (id: string) => {
		const target = HISTORY_ITEMS.find((item) => item.id === id);
		if (!target) return;
		setSelectedId(id);
		setCurrentId(id);
		setToast(`Successfully published ${target.version}`);
		window.setTimeout(() => setToast(null), 2200);
	};

	useEffect(() => {
		if (shouldReduceMotion || isUserInteracting) {
			setCursorVisible(false);
			return;
		}

		setCursorVisible(true);
		let cancelled = false;
		const timers: number[] = [];

		const wait = (ms: number) =>
			new Promise<void>((resolve) => {
				timers.push(window.setTimeout(resolve, ms));
			});

		const pointAt = (
			el: HTMLElement | null,
			offset: { x: number; y: number },
		) => {
			const root = rootRef.current;
			if (!el || !root) return;
			const a = el.getBoundingClientRect();
			const b = root.getBoundingClientRect();
			setCursorPos({
				x: a.left - b.left + offset.x,
				y: a.top - b.top + offset.y,
			});
		};

		const run = async () => {
			await wait(400);
			while (!cancelled) {
				for (const id of ["v4", "v6"] as const) {
					if (cancelled) return;
					setHoveredId(id);
					setSelectedId(id);
					await wait(40);
					pointAt(rowRefs.current[id], { x: 88, y: 16 });
					await wait(520);
					if (cancelled) return;

					pointAt(restoreRefs.current[id], { x: 22, y: 8 });
					await wait(480);
					if (cancelled) return;
					restore(id);
					await wait(200);
					if (cancelled) return;

					setHoveredId(null);
					setCursorPos((prev) => ({
						x: prev.x + (id === "v4" ? 36 : -28),
						y: prev.y + 42,
					}));
					await wait(2400);
				}
			}
		};

		void run();
		return () => {
			cancelled = true;
			for (const timer of timers) window.clearTimeout(timer);
		};
	}, [shouldReduceMotion, isUserInteracting]);

	return (
		<div
			ref={rootRef}
			onMouseEnter={() => setIsUserInteracting(true)}
			onMouseLeave={() => {
				setIsUserInteracting(false);
				setHoveredId(null);
			}}
			className="relative mx-auto h-full w-full max-w-xl"
		>
			<AnimatePresence>
				{cursorVisible && !isUserInteracting ? (
					<motion.div
						aria-hidden
						className="pointer-events-none absolute top-0 left-0 z-30"
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{
							x: cursorPos.x,
							y: cursorPos.y,
							scale: 1,
							opacity: 1,
						}}
						exit={{ opacity: 0, scale: 0.97 }}
						transition={{ duration: 0.42, ease: EASE_MOVE }}
						style={{ transformOrigin: "2px 2px" }}
					>
						<Icon
							name="cursor"
							className="size-4 drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]"
							style={{ color: "#10b981" }}
						/>
						<span
							className="absolute top-[14px] left-[12px] whitespace-nowrap rounded-md px-1.5 py-[3px] font-semibold text-[10px] text-white leading-none shadow-[0_1px_2px_rgba(0,0,0,0.18)]"
							style={{ backgroundColor: "#10b981" }}
						>
							Maya
						</span>
					</motion.div>
				) : null}
			</AnimatePresence>

			<div className="relative h-full overflow-hidden rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-6 shadow-xs sm:p-8 dark:border-white/10 dark:bg-[#0c0c0e]">
				<div className="mb-6 flex items-center justify-between">
					<h3 className="font-semibold text-sm text-text-strong-950 tracking-tight dark:text-white">
						Version history
					</h3>
					<span className="text-[11px] text-text-soft-400 dark:text-white/40">
						{HISTORY_ITEMS.length} snapshots
					</span>
				</div>

				<div className="relative">
					<div className="absolute top-3 bottom-3 left-6 w-px bg-stroke-soft-200 dark:bg-white/10" />
					<div className="space-y-3.5">
						{HISTORY_ITEMS.map((item) => {
							const isCurrent = currentId === item.id;
							const isActive = hoveredId === item.id || selectedId === item.id;

							return (
								<div
									key={item.id}
									ref={(node) => {
										rowRefs.current[item.id] = node;
									}}
									onClick={() => {
										setSelectedId(item.id);
										setHoveredId(item.id);
									}}
									onMouseEnter={() => setHoveredId(item.id)}
									className={cn(
										"group relative grid cursor-pointer grid-cols-[36px_minmax(0,1fr)_auto] items-start gap-x-3 rounded-xl px-1.5 py-2 transition-colors duration-200",
										isActive
											? "bg-neutral-100 dark:bg-white/[0.04]"
											: "hover:bg-neutral-50 dark:hover:bg-white/[0.02]",
									)}
								>
									<div className="relative z-10 flex h-6 w-9 items-center justify-center">
										<span
											className={cn(
												"flex h-6 w-9 items-center justify-center rounded-full font-semibold text-[10px] tracking-tight",
												isCurrent
													? "bg-text-strong-950 text-white dark:bg-white dark:text-black"
													: "bg-neutral-200 text-neutral-600 dark:bg-[#1c1c21] dark:text-neutral-400",
											)}
										>
											{item.version}
										</span>
									</div>

									<div className="min-w-0">
										<p className="h-6 truncate font-medium text-[13px] text-text-strong-950 leading-6 dark:text-white">
											{item.title}
										</p>
										<p className="mt-1 flex h-4 items-center gap-1.5 text-[11.5px] text-text-sub-600 dark:text-white/50">
											<span
												className={cn(
													"flex size-4 shrink-0 items-center justify-center rounded-full font-semibold text-[9px] leading-none",
													item.avatar,
												)}
											>
												{item.initial}
											</span>
											<span className="leading-none">{item.author}</span>
											<span className="text-text-soft-400 dark:text-white/30">
												·
											</span>
											<span className="leading-none">{item.timestamp}</span>
										</p>
									</div>

									<div className="flex items-center justify-end self-stretch">
										{isCurrent ? (
											<motion.span
												layoutId={
													shouldReduceMotion
														? undefined
														: "version-current-badge"
												}
												className="inline-flex h-6 items-center rounded-md bg-emerald-500/10 px-2 font-medium text-[10.5px] text-emerald-700 dark:text-emerald-400"
												transition={{ duration: 0.22, ease: EASE_OUT }}
											>
												Published
											</motion.span>
										) : (
											<button
												ref={(node) => {
													restoreRefs.current[item.id] = node;
												}}
												type="button"
												onClick={(event) => {
													event.stopPropagation();
													restore(item.id);
												}}
												className={cn(
													"inline-flex h-6 items-center justify-center gap-1.5 rounded-md border border-neutral-200 bg-white px-2 font-medium text-[11px] text-neutral-900 leading-none shadow-xs transition-opacity duration-150 dark:border-white/10 dark:bg-[#1c1c21] dark:text-white dark:shadow-none",
													isActive
														? "opacity-100"
														: "pointer-events-none opacity-0 group-hover:pointer-events-auto group-hover:opacity-100",
												)}
											>
												<RestoreIcon className="size-3 shrink-0" />
												<span className="leading-none">Restore</span>
											</button>
										)}
									</div>
								</div>
							);
						})}
					</div>
				</div>

				<div
					aria-hidden
					className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-40"
				>
					<div className="absolute inset-0 backdrop-blur-[10px] [mask-image:linear-gradient(to_bottom,transparent,black_60%)]" />
					<div className="absolute inset-0 bg-gradient-to-t from-15% from-bg-white-0 via-bg-white-0/75 to-transparent dark:from-[#0c0c0e] dark:via-[#0c0c0e]/75" />
				</div>

				<AnimatePresence>
					{toast ? (
						<motion.div
							initial={{ opacity: 0, y: 8, scale: 0.96 }}
							animate={{ opacity: 1, y: 0, scale: 1 }}
							exit={{ opacity: 0, y: 6, scale: 0.97 }}
							transition={{ duration: 0.2, ease: EASE_OUT }}
							className="-translate-x-1/2 absolute bottom-4 left-1/2 z-30 flex items-center gap-1.5 rounded-full border border-stroke-soft-200 bg-bg-white-0 px-3.5 py-1.5 font-medium text-[11.5px] text-text-strong-950 shadow-lg dark:border-white/10 dark:bg-[#151518] dark:text-white"
						>
							<span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-success-base text-static-white">
								<Icon name="check" className="size-2.5" />
							</span>
							<span>{toast}</span>
						</motion.div>
					) : null}
				</AnimatePresence>
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
