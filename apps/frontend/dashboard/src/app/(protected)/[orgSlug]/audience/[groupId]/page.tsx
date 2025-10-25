"use client";
import { AudienceList } from "./components/audience-list";

interface AudienceGroupPageProps {
	params: {
		groupId: string;
	};
}

const AudienceGroupPage = ({ params }: AudienceGroupPageProps) => {
	return <AudienceList groupId={params.groupId} />;
};

export default AudienceGroupPage;
