"use client";

import * as Alert from "@reloop/ui/alert";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import Spinner from "@reloop/ui/spinner";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import {
	createDeliverabilitySession,
	type DeliverabilityReport,
	injectTestMime,
	pollDeliverabilitySession,
} from "./check-api";
import { ReportView } from "./report-view";

const SAMPLE_TEST_MIME = `From: "Acme Product Team" <newsletter@acme-corp.com>
To: RECIPIENT_PLACEHOLDER
Subject: Your March Product Updates & Analytics
Date: Tue, 25 Aug 2026 12:00:00 +0000
Message-ID: <msg-98765@acme-corp.com>
Return-Path: <bounces@acme-corp.com>
Received: from mail.acme-corp.com (mail.acme-corp.com [198.51.100.42]) by inbound.reloop.sh; Tue, 25 Aug 2026 12:00:01 +0000
DKIM-Signature: v=1; a=rsa-sha256; d=acme-corp.com; s=k1; c=relaxed/relaxed; q=dns/txt; bh=abc123==; b=xyz456==
Authentication-Results: mx.reloop.sh; dkim=pass (signature verified); spf=pass (acme-corp.com: 198.51.100.42)
X-Spam-Score: -0.5
X-Spam-Status: No, score=-0.5 required=5 tests=R_SPF_ALLOW,R_DKIM_ALLOW,MIME_GOOD
List-Unsubscribe: <https://acme-corp.com/unsubscribe>, <mailto:unsub@acme-corp.com>
List-Unsubscribe-Post: List-Unsubscribe=One-Click
Content-Type: multipart/alternative; boundary="boundary-reloop-test"

--boundary-reloop-test
Content-Type: text/plain; charset="utf-8"

Hello! Here is your March summary from Acme.
Check your updated dashboard at https://acme-corp.com/dashboard

--boundary-reloop-test
Content-Type: text/html; charset="utf-8"

<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; color: #111;">
  <h2>Your March Summary</h2>
  <p>Hello! Here is your product summary for this month.</p>
  <p><a href="https://acme-corp.com/dashboard">View Your Dashboard</a></p>
  <img src="https://acme-corp.com/logo.png" alt="Acme Logo" width="120" />
</body>
</html>
--boundary-reloop-test--`;

export function TesterPanel() {
	const [token, setToken] = useState<string | null>(null);
	const [address, setAddress] = useState<string>("");
	const [expiresAt, setExpiresAt] = useState<string>("");
	const [report, setReport] = useState<DeliverabilityReport | null>(null);
	const [status, setStatus] = useState<
		"loading" | "waiting" | "analyzing" | "ready" | "error"
	>("loading");
	const [errorMessage, setErrorMessage] = useState<string>("");
	const [copied, setCopied] = useState(false);
	const [timeLeft, setTimeLeft] = useState<string>("");
	const [isChecking, setIsChecking] = useState(false);
	const [checkingSecondsLeft, setCheckingSecondsLeft] = useState(30);
	const [isInjectingSample, setIsInjectingSample] = useState(false);
	const [noEmailFoundAlert, setNoEmailFoundAlert] = useState(false);

	const checkingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
		null,
	);

	// 1. Initialize session on mount
	const initSession = async () => {
		setStatus("loading");
		setErrorMessage("");
		setNoEmailFoundAlert(false);
		try {
			const res = await createDeliverabilitySession();
			setToken(res.token);
			setAddress(res.address);
			setExpiresAt(res.expiresAt);
			setStatus("waiting");
		} catch (err: unknown) {
			setStatus("error");
			setErrorMessage(
				err instanceof Error
					? err.message
					: "Failed to initialize test session. Please try again.",
			);
		}
	};

	useEffect(() => {
		initSession();
		return () => {
			if (checkingIntervalRef.current)
				clearInterval(checkingIntervalRef.current);
		};
	}, []);

	// 2. Countdown timer for session expiration
	useEffect(() => {
		if (!expiresAt) return;
		const updateTimer = () => {
			const diff = new Date(expiresAt).getTime() - Date.now();
			if (diff <= 0) {
				setTimeLeft("Expired");
				return;
			}
			const hours = Math.floor(diff / (1000 * 60 * 60));
			const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
			const seconds = Math.floor((diff % (1000 * 60)) / 1000);
			setTimeLeft(
				`${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
			);
		};
		updateTimer();
		const interval = setInterval(updateTimer, 1000);
		return () => clearInterval(interval);
	}, [expiresAt]);

	const handleCopy = async () => {
		if (!address) return;
		try {
			await navigator.clipboard.writeText(address);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch {}
	};

	// 3. User clicks "Check Deliverability Score"
	const handleCheckScore = async () => {
		if (!token || isChecking) return;
		setIsChecking(true);
		setCheckingSecondsLeft(30);
		setNoEmailFoundAlert(false);

		// First immediate check
		try {
			const checkRes = await pollDeliverabilitySession(token);
			if (checkRes.status === "received" && checkRes.report) {
				setReport(checkRes.report);
				setStatus("ready");
				setIsChecking(false);
				return;
			}
		} catch {}

		// If not received yet, poll every 2s for 30s
		let secondsRemaining = 30;
		if (checkingIntervalRef.current) clearInterval(checkingIntervalRef.current);

		checkingIntervalRef.current = setInterval(async () => {
			secondsRemaining -= 2;
			setCheckingSecondsLeft(Math.max(0, secondsRemaining));

			try {
				const checkRes = await pollDeliverabilitySession(token);
				if (checkRes.status === "received" && checkRes.report) {
					if (checkingIntervalRef.current)
						clearInterval(checkingIntervalRef.current);
					setReport(checkRes.report);
					setStatus("ready");
					setIsChecking(false);
					return;
				}
			} catch {}

			if (secondsRemaining <= 0) {
				if (checkingIntervalRef.current)
					clearInterval(checkingIntervalRef.current);
				setIsChecking(false);
				setNoEmailFoundAlert(true);
			}
		}, 2000);
	};

	// 4. Quick sample injection handler
	const handleInjectSample = async () => {
		if (!address || !token) return;
		setIsInjectingSample(true);
		setNoEmailFoundAlert(false);
		try {
			const preparedMime = SAMPLE_TEST_MIME.replace(
				"RECIPIENT_PLACEHOLDER",
				address,
			);
			const injectRes = await injectTestMime(preparedMime);
			if (injectRes.success) {
				const checkRes = await pollDeliverabilitySession(token);
				if (checkRes.status === "received" && checkRes.report) {
					setReport(checkRes.report);
					setStatus("ready");
					return;
				}
			}
		} catch {
			setErrorMessage("Sample test injection failed.");
		} finally {
			setIsInjectingSample(false);
		}
	};

	if (status === "ready" && report) {
		return <ReportView report={report} onReset={initSession} />;
	}

	return (
		<div className="mx-auto max-w-2xl">
			{status === "error" && (
				<div className="mb-6">
					<Alert.Root variant="lighter" status="error" size="large">
						<Alert.Icon as={Icon} name="alert-triangle" />
						<div className="flex-1">
							<div className="font-medium text-label-sm">Session Error</div>
							<p className="mt-0.5 text-paragraph-sm">{errorMessage}</p>
						</div>
						<FancyButton.Root
							variant="basic"
							size="small"
							onClick={initSession}
						>
							Try Again
						</FancyButton.Root>
					</Alert.Root>
				</div>
			)}

			<div className="relative overflow-hidden rounded-3xl border border-stroke-soft-200 bg-bg-white-0 p-6 shadow-sm sm:p-8 dark:border-white/10 dark:bg-[#121212]">
				{/* Step 1 Header */}
				<div className="flex items-center justify-between">
					<span className="inline-flex items-center gap-2 rounded-full border border-stroke-soft-200 bg-bg-weak-50/80 px-3 py-1 font-mono text-[11px] text-text-sub-600 uppercase tracking-[0.1em] dark:border-white/12 dark:bg-white/[0.05] dark:text-white/60">
						<span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
						Step 1: Send Your Test Email
					</span>

					{expiresAt && (
						<span className="font-mono text-[12px] text-text-sub-600 dark:text-white/40">
							Expires in:{" "}
							<strong className="font-semibold text-text-strong-950 dark:text-white">
								{timeLeft}
							</strong>
						</span>
					)}
				</div>

				<h2 className="mt-5 font-semibold text-2xl text-text-strong-950 tracking-tight sm:text-3xl dark:text-white">
					Send an email to this address
				</h2>
				<p className="mt-2 text-[14.5px] text-text-sub-600 leading-relaxed dark:text-white/60">
					Copy this temporary inbox address into your ESP (or email client) and
					send your campaign.
				</p>

				{/* Big Address Copy Box */}
				<div className="mt-6">
					<div className="relative flex flex-col gap-2 rounded-2xl border border-stroke-soft-200 bg-bg-weak-50/70 p-2 sm:flex-row sm:items-center dark:border-white/10 dark:bg-white/[0.03]">
						<div className="flex min-w-0 flex-1 items-center px-3 py-2">
							<Icon
								name="mail"
								className="mr-3 size-4 shrink-0 text-text-sub-600 dark:text-white/40"
							/>
							<input
								readOnly
								value={address || "Generating address..."}
								onClick={handleCopy}
								className="w-full cursor-pointer select-all truncate bg-transparent font-medium font-mono text-[14px] text-text-strong-950 outline-none sm:text-[14px] dark:text-white"
							/>
						</div>

						<FancyButton.Root
							variant="basic"
							size="small"
							onClick={handleCopy}
							disabled={!address}
							className="shrink-0"
						>
							<Icon
								name="copy"
								className="size-4 shrink-0 text-text-sub-600 dark:text-white/40"
							/>
							{copied ? "Copied!" : "Copy Address"}
						</FancyButton.Root>
					</div>
				</div>

				{/* Step 2: "Check Deliverability Score" Button */}
				<div className="mt-5">
					<FancyButton.Root
						variant="primary"
						size="medium"
						onClick={handleCheckScore}
						disabled={status === "loading" || isChecking || !token}
						className="w-full"
					>
						{isChecking ? (
							<>
								<Spinner size={18} />
								<span>
									Checking for incoming email ({checkingSecondsLeft}s)...
								</span>
							</>
						) : (
							<>
								<FancyButton.Icon as={Icon} name="shield-check" />
								<span>Check Deliverability Score</span>
							</>
						)}
					</FancyButton.Root>
				</div>

				{/* Active Radar / Checking State */}
				{isChecking && (
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-primary-base/20 bg-primary-base/[0.03] py-7 text-center dark:border-primary-base/20 dark:bg-primary-base/[0.05]"
					>
						<div className="relative flex size-12 items-center justify-center">
							<span className="absolute inline-flex size-full animate-ping rounded-full bg-primary-base/20 opacity-75" />
							<div className="relative flex size-10 items-center justify-center rounded-full bg-primary-base/10 text-primary-base">
								<Spinner size={20} />
							</div>
						</div>

						<p className="mt-3.5 font-medium text-[14px] text-text-strong-950 dark:text-white">
							Listening for incoming message ({checkingSecondsLeft}s)...
						</p>
						<p className="mt-1 max-w-sm text-[12px] text-text-sub-600 dark:text-white/50">
							Most email servers deliver within 5–15 seconds. As soon as your
							message lands, your deliverability report will open automatically.
						</p>
					</motion.div>
				)}

				{/* No Email Found Alert */}
				{noEmailFoundAlert && !isChecking && (
					<motion.div
						initial={{ opacity: 0, y: 8 }}
						animate={{ opacity: 1, y: 0 }}
						className="mt-6"
					>
						<Alert.Root variant="lighter" status="warning" size="large">
							<Alert.Icon as={Icon} name="help-circle" />
							<div className="flex-1">
								<div className="font-medium text-label-sm">
									No email received yet
								</div>
								<p className="mt-0.5 text-paragraph-sm">
									We haven't received a message sent to{" "}
									<strong className="font-mono">{address}</strong> yet. Make
									sure your ESP has completed sending and click{" "}
									<strong>Check Deliverability Score</strong> again.
								</p>
							</div>
						</Alert.Root>
					</motion.div>
				)}

				{/* Quick sample injection helper */}
				<div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-stroke-soft-200/60 border-t pt-4 text-[12.5px] text-text-sub-600 dark:border-white/10 dark:text-white/45">
					<span>Want to test without opening your mail client?</span>
					<button
						type="button"
						onClick={handleInjectSample}
						disabled={!address || isInjectingSample || isChecking}
						className="group inline-flex items-center gap-1 font-medium text-text-strong-950 transition-colors hover:text-primary-base disabled:opacity-50 dark:text-white dark:hover:text-primary-base"
					>
						{isInjectingSample
							? "Injecting sample..."
							: "Send sample test email"}
						<Icon
							name="arrow-right"
							className="size-3 transition-transform group-hover:translate-x-0.5"
						/>
					</button>
				</div>
			</div>
		</div>
	);
}
