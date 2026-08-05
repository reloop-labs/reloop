import * as FancyButton from "@reloop/ui/fancy-button";
import Spinner from "@reloop/ui/spinner";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, type FormEvent } from "react";
import { ActionKbd } from "#/features/dashboard/keyboard-shortcuts-reveal";
import { CompanyNameField } from "./company-name-field";
import { LogoUpload } from "./logo-upload";
import { ReferralField } from "./referral-field";
import { useCreateOrg } from "./use-create-org";
import { useLogoUpload } from "./use-logo-upload";

/** Light keycap so it reads on the blue FancyButton fill. */
const actionKbdOnBlueClassName =
	"border-white/25 bg-white/15 text-white shadow-[0_1.5px_0_0_rgba(0,0,0,0.2)] dark:border-white/25 dark:bg-white/15 dark:text-white dark:shadow-[0_1.5px_0_0_rgba(0,0,0,0.35)]";

export function CreateOrgStep() {
	const {
		fileInputRef,
		isUploading,
		logoPreview,
		logoUrl,
		openFilePicker,
		onFileChange,
	} = useLogoUpload();

	const {
		isCreating,
		name,
		orgId,
		referral,
		otherReferral,
		createAndContinue,
	} = useCreateOrg();

	const canSubmit =
		Boolean(name) &&
		!isUploading &&
		!isCreating &&
		!(referral === "other" && !otherReferral);

	// Enter in any field inside this form natively submits (type="submit" button).
	// Prefer form onSubmit over a document-level Enter hotkey — more reliable and
	// matches step 2 (Add Domain). Referral search is portaled outside the form.
	const handleSubmit = useCallback(
		(e: FormEvent) => {
			e.preventDefault();
			if (!canSubmit) return;
			void createAndContinue();
		},
		[canSubmit, createAndContinue],
	);

	return (
		<div>
			<div className="mb-6">
				<h1 className="font-semibold text-[26px] text-text-strong-950 tracking-tight">
					Let's setup your organization
				</h1>
				<p className="text-sm text-text-sub-600">
					Enter your organization details to start sending emails
				</p>
			</div>
			<LogoUpload
				fileInputRef={fileInputRef}
				isUploading={isUploading}
				logoPreview={logoPreview}
				logoUrl={logoUrl}
				onFileChange={onFileChange}
				onUploadClick={openFilePicker}
			/>

			<form onSubmit={handleSubmit}>
				<motion.div layout className="space-y-3.5 pt-6">
					<CompanyNameField />
					<ReferralField />
				</motion.div>

				<FancyButton.Root
					type="submit"
					variant="blue"
					size="medium"
					className="mt-6 h-10 w-full overflow-hidden rounded-xl font-medium text-sm"
					disabled={!canSubmit}
				>
					<AnimatePresence mode="popLayout" initial={false}>
						<motion.span
							key={isCreating ? "creating" : orgId ? "continue" : "create"}
							transition={{
								type: "spring",
								duration: 0.25,
								bounce: 0,
							}}
							initial={{
								opacity: 0,
								y: -14,
							}}
							animate={{
								opacity: 1,
								y: 0,
							}}
							exit={{
								opacity: 0,
								y: 14,
							}}
							className="flex items-center justify-center gap-1.5"
						>
							{isCreating ? (
								<>
									<Spinner size={14} color="currentColor" />
									<span>Creating...</span>
								</>
							) : orgId ? (
								<>
									<span>Continue</span>
									<ActionKbd className={actionKbdOnBlueClassName}>↵</ActionKbd>
								</>
							) : (
								<>
									<span>Create organization</span>
									<ActionKbd className={actionKbdOnBlueClassName}>↵</ActionKbd>
								</>
							)}
						</motion.span>
					</AnimatePresence>
				</FancyButton.Root>
			</form>
		</div>
	);
}
