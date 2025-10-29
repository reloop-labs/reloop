"use client";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

import { DomainListSidebar } from "./components/domain-list";

const DomainPage = () => {
	return <DomainListSidebar />;
};

export default DomainPage;
