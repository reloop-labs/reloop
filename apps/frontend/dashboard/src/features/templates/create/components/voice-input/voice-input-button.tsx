import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function VoiceInputButton({
	onTranscript,
}: {
	onTranscript: (text: string) => void;
}) {
	const [isListening, setIsListening] = useState(false);
	const [hasSupport, setHasSupport] = useState(true);

	useEffect(() => {
		if (
			typeof window !== "undefined" &&
			!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)
		) {
			setHasSupport(false);
		}
	}, []);

	const toggleListening = () => {
		if (!hasSupport) {
			toast.info("Voice recognition is not supported in this browser");
			return;
		}

		try {
			const SpeechRecognition =
				(window as any).SpeechRecognition ||
				(window as any).webkitSpeechRecognition;
			if (!SpeechRecognition) return;

			const recognition = new SpeechRecognition();
			recognition.continuous = false;
			recognition.interimResults = false;
			recognition.lang = "en-US";

			recognition.onstart = () => {
				setIsListening(true);
				toast.message("Listening... Speak your prompt");
			};

			recognition.onresult = (event: any) => {
				const transcript = event.results?.[0]?.[0]?.transcript;
				if (transcript) {
					onTranscript(transcript);
				}
				setIsListening(false);
			};

			recognition.onerror = () => {
				setIsListening(false);
				toast.error("Voice input error");
			};

			recognition.onend = () => {
				setIsListening(false);
			};

			recognition.start();
		} catch {
			setIsListening(false);
		}
	};

	return (
		<button
			type="button"
			onClick={toggleListening}
			title={isListening ? "Listening..." : "Voice input"}
			className={cn(
				"flex h-8 w-8 items-center justify-center rounded-lg border border-stroke-soft-200 transition-all dark:border-white/15",
				isListening
					? "animate-pulse border-red-600 bg-red-500 text-white"
					: "bg-bg-white-0 text-text-strong-950 hover:bg-bg-weak-100 dark:bg-white/10 dark:hover:bg-white/15",
			)}
		>
			<Icon name="volume-high" className="h-4 w-4" />
		</button>
	);
}
