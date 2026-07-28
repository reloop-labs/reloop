import * as FancyButton from "@reloop/ui/fancy-button";
import Spinner from "@reloop/ui/spinner";
import { AnimatePresence, motion } from "framer-motion";
import { CompanyNameField } from "./company-name-field";
import { LogoUpload } from "./logo-upload";
import { useCreateOrg } from "./use-create-org";
import { useLogoUpload } from "./use-logo-upload";

export function CreateOrgStep() {
	const {
		fileInputRef,
		isUploading,
		logoPreview,
		logoUrl,
		openFilePicker,
		onFileChange,
	} = useLogoUpload();

	const { isCreating, name, orgId, createAndContinue } = useCreateOrg();

	const canSubmit = Boolean(name) && !isUploading && !isCreating;

	return (
		<div>
			<div className="mb-6 space-y-1">
				<h1 className="font-semibold text-[26px] text-text-strong-950 tracking-tight">
					Let's setup your organization
				</h1>
				<p className="text-paragraph-sm text-text-sub-600 leading-relaxed">
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

			<motion.div layout className="space-y-3.5 pt-6">
				<CompanyNameField />
			</motion.div>

			<FancyButton.Root
				variant="blue"
				size="medium"
				className="mt-6 h-10 w-full overflow-hidden rounded-xl font-medium text-sm"
				onClick={createAndContinue}
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
							<span>Continue</span>
						) : (
							<span>Create organization</span>
						)}
					</motion.span>
				</AnimatePresence>
			</FancyButton.Root>
		</div>
	);
}
