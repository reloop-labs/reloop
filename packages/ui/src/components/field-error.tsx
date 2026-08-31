"use client";

import { cn } from "@reloop/ui/cn";
import {
	type ReactNode,
	type RefObject,
	useCallback,
	useEffect,
	useId,
	useRef,
	useState,
} from "react";

export function readShakeMs(): number {
	if (typeof window === "undefined") return 280;
	const cs = getComputedStyle(document.documentElement);
	const ms = (name: string, fallback: number) => {
		const v = Number.parseFloat(cs.getPropertyValue(name));
		return Number.isFinite(v) ? v : fallback;
	};
	return ms("--shake-dur-a", 80) * 2 + ms("--shake-dur-b", 60) * 2;
}

function prefersReducedMotion() {
	return (
		typeof window !== "undefined" &&
		window.matchMedia("(prefers-reduced-motion: reduce)").matches
	);
}

export type FieldErrorController<T extends HTMLElement = HTMLInputElement> = {
	hasError: boolean;
	message: string;
	errorId: string;
	inputRef: RefObject<T | null>;
	shakeRef: RefObject<HTMLDivElement | null>;
	show: (message: string) => void;
	clear: () => void;
	controlProps: {
		ref: RefObject<T | null>;
		"aria-invalid": boolean;
		"aria-describedby": string | undefined;
	};
};

export function useFieldError<
	T extends HTMLElement = HTMLInputElement,
>(): FieldErrorController<T> {
	const [error, setError] = useState<string | null>(null);
	const [message, setMessage] = useState("");
	const inputRef = useRef<T>(null);
	const shakeRef = useRef<HTMLDivElement>(null);
	const shakeTimerRef = useRef<number | null>(null);
	const errorId = useId();
	const hasError = error !== null;

	useEffect(() => {
		return () => {
			if (shakeTimerRef.current !== null) {
				window.clearTimeout(shakeTimerRef.current);
			}
		};
	}, []);

	const clear = useCallback(() => {
		setError(null);
		if (shakeTimerRef.current !== null) {
			window.clearTimeout(shakeTimerRef.current);
			shakeTimerRef.current = null;
		}
		shakeRef.current?.classList.remove("is-shaking");
	}, []);

	const show = useCallback((next: string) => {
		setError(next);
		setMessage(next);
		inputRef.current?.focus();

		const field = shakeRef.current;
		if (!field || prefersReducedMotion()) return;

		field.classList.remove("is-shaking");
		void field.offsetWidth;
		field.classList.add("is-shaking");

		if (shakeTimerRef.current !== null) {
			window.clearTimeout(shakeTimerRef.current);
		}
		shakeTimerRef.current = window.setTimeout(() => {
			field.classList.remove("is-shaking");
			shakeTimerRef.current = null;
		}, readShakeMs() + 20);
	}, []);

	return {
		hasError,
		message,
		errorId,
		inputRef,
		shakeRef,
		show,
		clear,
		controlProps: {
			ref: inputRef,
			"aria-invalid": hasError,
			"aria-describedby": hasError ? errorId : undefined,
		},
	};
}

export function FieldError({
	field,
	hint,
	children,
	className,
	hintClassName,
	messageClassName,
}: {
	field: Pick<
		FieldErrorController,
		"hasError" | "errorId" | "message" | "shakeRef"
	>;
	hint?: ReactNode;
	children: ReactNode;
	className?: string;
	hintClassName?: string;
	messageClassName?: string;
}) {
	return (
		<div
			className={cn("t-input-wrap", field.hasError && "is-error", className)}
		>
			<div
				ref={field.shakeRef}
				className={cn("t-input w-full", field.hasError && "is-error")}
			>
				{children}
			</div>
			{hint ? (
				<p
					className={cn(
						"t-hint text-paragraph-xs text-text-sub-600",
						hintClassName,
					)}
				>
					{hint}
				</p>
			) : null}
			<p
				id={field.errorId}
				role="alert"
				className={cn(
					"t-error-msg text-error-base text-paragraph-xs",
					messageClassName,
				)}
			>
				{field.message}
			</p>
		</div>
	);
}
