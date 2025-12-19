"use client";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import { useState } from "react";
import { CreateTopicModal } from "../contacts/components/create-topic-modal";
import { TopicList } from "../contacts/components/topic-list";

const TopicsPage = () => {
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

	return (
		<div className="mx-auto max-w-3xl sm:px-8">
			{/* Header */}
			<div className="flex items-center justify-between pt-10">
				<p className="font-medium text-2xl">Topics</p>
				<div className="flex items-center gap-2">
					<Button.Root
						variant="neutral"
						size="xsmall"
						onClick={() => setIsCreateModalOpen(true)}
					>
						<Icon name="plus" className="h-4 w-4" />
						Add topic
					</Button.Root>
				</div>
			</div>

			{/* Content */}
			<div className="mt-6">
				<TopicList hideHeader />
			</div>

			<CreateTopicModal
				open={isCreateModalOpen}
				onOpenChange={setIsCreateModalOpen}
			/>
		</div>
	);
};

export default TopicsPage;
