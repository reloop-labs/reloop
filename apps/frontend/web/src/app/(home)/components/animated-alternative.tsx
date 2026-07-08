"use client";

import { animate, cubicBezier, useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";

const alternatives = [
	"Resend",
	"Mailgun",
	"SendGrid",
	"AWS SES",
	"Postmark",
	"Loops",
	"Mailchimp",
] as const;

const ENTER_DURATION_MS = 648;
const ENTER_STAGGER_MS = 18;
const EXIT_DURATION_MS = 432;
const EXIT_STAGGER_MS = 11;
const HOLD_MS = 550;
const GAP_MS = 320;
const Y_TRAVEL_MULTIPLIER = 0.58;

const enterEase = cubicBezier(0.22, 1, 0.36, 1);
const exitEase = cubicBezier(0.64, 0, 0.78, 0);

const longestAlternative = alternatives.reduce((longest, word) =>
	word.length > longest.length ? word : longest,
);

function sleep(ms: number) {
	return new Promise<void>((resolve) => {
		window.setTimeout(resolve, ms);
	});
}

function setUnitFrame(
	unit: HTMLSpanElement,
	opacity: number,
	yPx: number,
	blurPx: number,
) {
	unit.style.opacity = String(opacity);
	unit.style.transform = `translate3d(0, ${yPx * Y_TRAVEL_MULTIPLIER}px, 0)`;
	unit.style.filter = `blur(${blurPx}px)`;
}

function createPhrase(container: HTMLElement, text: string) {
	container.replaceChildren();

	const title = document.createElement("span");
	title.style.display = "inline-block";
	title.style.transformStyle = "preserve-3d";

	const units: HTMLSpanElement[] = [];

	for (const char of Array.from(text)) {
		const unit = document.createElement("span");
		unit.style.display = "inline-block";
		unit.style.backfaceVisibility = "hidden";
		unit.style.transformOrigin = "50% 55%";
		unit.style.whiteSpace = "pre";
		unit.style.willChange = "transform, opacity, filter";
		unit.textContent = char;
		title.appendChild(unit);
		units.push(unit);
	}

	container.appendChild(title);
	return units;
}

async function animateUnits(
	units: HTMLSpanElement[],
	phase: "enter" | "exit",
	activeControls: Set<ReturnType<typeof animate>>,
) {
	const isEnter = phase === "enter";
	const durationMs = isEnter ? ENTER_DURATION_MS : EXIT_DURATION_MS;
	const staggerMs = isEnter ? ENTER_STAGGER_MS : EXIT_STAGGER_MS;
	const ease = isEnter ? enterEase : exitEase;

	const from = isEnter
		? { opacity: 0, yPx: 16, blurPx: 12 }
		: { opacity: 1, yPx: 0, blurPx: 0 };
	const to = isEnter
		? { opacity: 1, yPx: 0, blurPx: 0 }
		: { opacity: 0, yPx: -16, blurPx: 12 };

	for (const unit of units) {
		setUnitFrame(unit, from.opacity, from.yPx, from.blurPx);
	}

	await Promise.all(
		units.map((unit, index) => {
			const fromY = from.yPx * Y_TRAVEL_MULTIPLIER;
			const toY = to.yPx * Y_TRAVEL_MULTIPLIER;

			const controls = animate(
				unit,
				{
					opacity: [from.opacity, to.opacity],
					transform: [
						`translate3d(0, ${fromY}px, 0)`,
						`translate3d(0, ${toY}px, 0)`,
					],
					filter: [`blur(${from.blurPx}px)`, `blur(${to.blurPx}px)`],
				} as Record<string, string[] | number[]>,
				{
					delay: (index * staggerMs) / 1000,
					duration: durationMs / 1000,
					ease,
				},
			);

			activeControls.add(controls);

			return controls.finished.then(() => {
				activeControls.delete(controls);
				setUnitFrame(unit, to.opacity, to.yPx, to.blurPx);
			});
		}),
	);
}

export function AnimatedAlternative() {
	const stageRef = useRef<HTMLSpanElement>(null);
	const indexRef = useRef(0);
	const activeRef = useRef(true);
	const reduceMotion = useReducedMotion();

	useEffect(() => {
		const stage = stageRef.current;
		if (!stage) return;

		activeRef.current = true;
		const activeControls = new Set<ReturnType<typeof animate>>();

		const stopControls = () => {
			for (const controls of activeControls) {
				controls.stop?.();
				controls.cancel?.();
			}
			activeControls.clear();
		};

		const runReducedMotion = async () => {
			let units = createPhrase(stage, alternatives[0] ?? "");
			for (const unit of units) {
				unit.style.opacity = "1";
				unit.style.transform = "translate3d(0, 0, 0)";
				unit.style.filter = "blur(0px)";
			}

			while (activeRef.current) {
				await sleep(HOLD_MS + GAP_MS);
				if (!activeRef.current) break;

				indexRef.current = (indexRef.current + 1) % alternatives.length;
				units = createPhrase(stage, alternatives[indexRef.current] ?? "");
				for (const unit of units) {
					unit.style.opacity = "1";
					unit.style.transform = "translate3d(0, 0, 0)";
					unit.style.filter = "blur(0px)";
				}
			}
		};

		const run = async () => {
			if (reduceMotion) {
				await runReducedMotion();
				return;
			}

			await sleep(Math.random() * 400);

			let currentUnits = createPhrase(stage, alternatives[0] ?? "");
			await animateUnits(currentUnits, "enter", activeControls);
			if (!activeRef.current) return;

			while (activeRef.current) {
				await sleep(HOLD_MS);
				if (!activeRef.current) break;

				await animateUnits(currentUnits, "exit", activeControls);
				if (!activeRef.current) break;

				indexRef.current = (indexRef.current + 1) % alternatives.length;
				currentUnits = createPhrase(stage, alternatives[indexRef.current] ?? "");
				await animateUnits(currentUnits, "enter", activeControls);
				if (!activeRef.current) break;

				await sleep(GAP_MS);
			}
		};

		void run();

		return () => {
			activeRef.current = false;
			stopControls();
		};
	}, [reduceMotion]);

	return (
		<span className="inline-flex items-center gap-1.5 text-sm">
			<span className="font-medium text-text-sub-600">
				An open-source alternative to
			</span>
			<span
				ref={stageRef}
				className="inline-block text-left font-semibold text-text-strong-950 dark:text-white"
				style={{
					minWidth: `${longestAlternative.length}ch`,
					perspective: "900px",
				}}
				aria-live="polite"
				aria-atomic="true"
			/>
		</span>
	);
}
