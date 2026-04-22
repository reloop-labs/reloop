"use client";

import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import axios from "axios";
import {
	CheckCircle2,
	Code,
	Copy,
	Key,
	Loader2,
	Lock,
	Plus,
	Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { parseAsString, useQueryState } from "nuqs";
import { useState } from "react";
import { toast } from "sonner";

export const GenerateApiKeyStep = () => {
	const [apiKey, setApiKey] = useQueryState(
		"apiKey",
		parseAsString.withDefault(""),
	);
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [copied, setCopied] = useState(false);

	const generateKey = async () => {
		setLoading(true);
		try {
			const response = await axios.post("/api/api-key/v1/", {
				name: "Default API Key",
			});
			setApiKey(response.data.key);
		} catch (error) {
			const errorMessage = axios.isAxiosError(error)
				? error.response?.data?.message || "Failed to generate API key"
				: "Failed to generate API key";
			toast.error(errorMessage);
		} finally {
			setLoading(false);
		}
	};

	const copyToClipboard = () => {
		navigator.clipboard.writeText(apiKey);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<div className="fade-in h-full animate-in space-y-6 duration-500">
			{!apiKey ? (
				<div className="flex w-full flex-col items-center justify-center p-4">
					{/* Illustration Area */}
					<div className="relative mb-8 flex h-64 w-64 items-center justify-center">
						{/* The Dashed Orbit Ring - Rotating */}
						<motion.div
							className="absolute inset-0 rounded-full border border-stroke-soft-200 border-dashed opacity-75"
							animate={{ rotate: 360 }}
							transition={{
								duration: 20,
								repeat: Number.POSITIVE_INFINITY,
								ease: "linear",
							}}
						/>

						{/* Inner Glow/Background - Pulsing */}
						<motion.div
							className="absolute h-32 w-32 rounded-full bg-bg-weak-50 opacity-60 blur-2xl"
							animate={{
								scale: [1, 1.1, 1],
								opacity: [0.4, 0.6, 0.4],
							}}
							transition={{
								duration: 3,
								repeat: Number.POSITIVE_INFINITY,
								ease: "easeInOut",
							}}
						/>

						{/* Center Element: The Main Key Icon - Floating */}
						<motion.div
							className="relative z-10 flex h-20 w-24 flex-col items-center justify-center rounded-xl border border-stroke-soft-100 bg-bg-white-0 shadow-sm"
							animate={{
								y: [0, -8, 0],
							}}
							transition={{
								duration: 2.5,
								repeat: Number.POSITIVE_INFINITY,
								ease: "easeInOut",
							}}
						>
							<div className="mb-2 h-2 w-full rounded-t-xl bg-bg-weak-50 opacity-50" />
							<motion.div
								style={{
									color: "rgb(156 163 175)",
								}}
								animate={{
									color: [
										"rgb(156 163 175)", // text-text-soft-400
										"rgb(59 130 246)", // primary-blue
										"rgb(34 197 94)", // success-green
										"rgb(156 163 175)", // back to soft
									],
								}}
								transition={{
									duration: 4,
									repeat: Number.POSITIVE_INFINITY,
									ease: "easeInOut",
								}}
							>
								<Key className="h-8 w-8" strokeWidth={1.5} />
							</motion.div>
							<div className="mt-2 h-1.5 w-12 rounded-full bg-bg-weak-50" />
						</motion.div>

						{/* Satellite Icon 1 (Top Left) - Lock - Floating */}
						<motion.div
							className="absolute top-8 left-8 flex h-10 w-10 items-center justify-center rounded-full border border-stroke-soft-100 bg-bg-white-0 shadow-sm"
							animate={{
								y: [0, -12, 0],
								rotate: [0, 5, -5, 0],
							}}
							transition={{
								duration: 3,
								repeat: Number.POSITIVE_INFINITY,
								ease: "easeInOut",
								delay: 0.2,
							}}
						>
							<motion.div
								style={{
									color: "rgb(156 163 175)",
								}}
								animate={{
									color: [
										"rgb(156 163 175)", // text-text-soft-400
										"rgb(239 68 68)", // error-red
										"rgb(34 197 94)", // success-green
										"rgb(156 163 175)", // back to soft
									],
								}}
								transition={{
									duration: 3.5,
									repeat: Number.POSITIVE_INFINITY,
									ease: "easeInOut",
									delay: 0.5,
								}}
							>
								<Lock className="h-4 w-4" />
							</motion.div>
						</motion.div>

						{/* Satellite Icon 2 (Top Right) - Code - Floating */}
						<motion.div
							className="absolute top-8 right-8 flex h-10 w-10 items-center justify-center rounded-full border border-stroke-soft-100 bg-bg-white-0 shadow-sm"
							animate={{
								y: [0, -10, 0],
								rotate: [0, -5, 5, 0],
							}}
							transition={{
								duration: 2.8,
								repeat: Number.POSITIVE_INFINITY,
								ease: "easeInOut",
								delay: 0.4,
							}}
						>
							<motion.div
								style={{
									color: "rgb(156 163 175)",
								}}
								animate={{
									color: [
										"rgb(156 163 175)", // text-text-soft-400
										"rgb(59 130 246)", // information-blue
										"rgb(168 85 247)", // feature-purple
										"rgb(156 163 175)", // back to soft
									],
								}}
								transition={{
									duration: 3.8,
									repeat: Number.POSITIVE_INFINITY,
									ease: "easeInOut",
									delay: 1,
								}}
							>
								<Code className="h-4 w-4" />
							</motion.div>
						</motion.div>

						{/* Satellite Icon 3 (Bottom Left) - Zap - Floating */}
						<motion.div
							className="absolute bottom-8 left-8 flex h-10 w-10 items-center justify-center rounded-full border border-stroke-soft-100 bg-bg-white-0 shadow-sm"
							animate={{
								y: [0, -8, 0],
								rotate: [0, 8, -8, 0],
							}}
							transition={{
								duration: 3.2,
								repeat: Number.POSITIVE_INFINITY,
								ease: "easeInOut",
								delay: 0.6,
							}}
						>
							<motion.div
								style={{
									color: "rgb(156 163 175)",
								}}
								animate={{
									color: [
										"rgb(156 163 175)", // text-text-soft-400
										"rgb(249 115 22)", // warning-orange
										"rgb(234 179 8)", // away-yellow
										"rgb(156 163 175)", // back to soft
									],
								}}
								transition={{
									duration: 3.2,
									repeat: Number.POSITIVE_INFINITY,
									ease: "easeInOut",
									delay: 1.5,
								}}
							>
								<Zap className="h-4 w-4" />
							</motion.div>
						</motion.div>

						{/* Satellite Icon 4 (Bottom Right) - Lock - Floating */}
						<motion.div
							className="absolute right-8 bottom-8 flex h-12 w-12 items-center justify-center rounded-full border border-stroke-soft-100 bg-bg-white-0 shadow-sm"
							animate={{
								y: [0, -14, 0],
								rotate: [0, -6, 6, 0],
							}}
							transition={{
								duration: 2.6,
								repeat: Number.POSITIVE_INFINITY,
								ease: "easeInOut",
								delay: 0.8,
							}}
						>
							<motion.div
								style={{
									color: "rgb(156 163 175)",
								}}
								animate={{
									color: [
										"rgb(156 163 175)", // text-text-soft-400
										"rgb(34 197 94)", // success-green
										"rgb(59 130 246)", // information-blue
										"rgb(156 163 175)", // back to soft
									],
								}}
								transition={{
									duration: 4.2,
									repeat: Number.POSITIVE_INFINITY,
									ease: "easeInOut",
									delay: 2,
								}}
							>
								<Lock className="h-5 w-5" />
							</motion.div>
						</motion.div>
					</div>
					<Button.Root
						variant="neutral"
						mode="filled"
						onClick={generateKey}
						disabled={loading}
						className="w-full"
					>
						{loading ? (
							<Loader2 className="h-4 w-4 animate-spin" />
						) : (
							<Plus className="h-4 w-4" />
						)}
						{loading ? "Generating..." : "Generate Secret Key"}
					</Button.Root>
				</div>
			) : (
				<div className="flex h-full flex-1 flex-col justify-between space-y-6">
					<div className="flex flex-col gap-1">
						<Label.Root htmlFor="api-key">Your API Key</Label.Root>
						<div className="group relative">
							<Input.Root size="small">
								<Input.Wrapper>
									<Input.Input
										id="api-key"
										type="text"
										readOnly
										value={apiKey}
										className="pr-14 font-mono"
									/>
								</Input.Wrapper>
							</Input.Root>
							<Button.Root
								variant="neutral"
								mode="ghost"
								size="xsmall"
								onClick={copyToClipboard}
								className="-translate-y-1/2 absolute top-1/2 right-2"
								title="Copy to clipboard"
							>
								{copied ? (
									<CheckCircle2 size={18} className="text-success-base" />
								) : (
									<Copy size={18} />
								)}
							</Button.Root>
						</div>
					</div>

					<div className="pt-4">
						<Button.Root
							variant="neutral"
							mode="filled"
							className="w-full"
							onClick={() => router.push("/")}
						>
							<Button.Icon>
								<Icon name="check-circle" className="h-4 w-4" />
							</Button.Icon>
							Go to Dashboard
						</Button.Root>
					</div>
				</div>
			)}
		</div>
	);
};
