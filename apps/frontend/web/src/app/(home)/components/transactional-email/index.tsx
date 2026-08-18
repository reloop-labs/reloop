import { SceneHeader } from "../_shared/scene-header";

export function TransactionalEmailSection() {
	return (
		<article
			id="email-system-transactional"
			data-scene="transactional"
			className="scroll-mt-28 px-4 py-12 sm:px-8 sm:py-16 lg:px-12 lg:py-16"
		>
			<SceneHeader
				icon="send-2"
				iconBgColor="bg-orange-500"
				badge="Transactional Eamil"
				title="It starts with transactional"
				description="One API, one SMTP relay. Same reliable payload from Node, Python, or a cron on the box."
				ctaLabel="Explore Transactional"
				ctaHref="/docs/transactional"
			/>

			<div className="relative mt-10 min-h-[20rem] overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-6 sm:min-h-[24rem] dark:border-white/10 dark:bg-black">
				{/* Transactional email interactive preview / visual */}
			</div>
		</article>
	);
}
