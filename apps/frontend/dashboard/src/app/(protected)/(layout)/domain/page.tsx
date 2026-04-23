"use client";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

import { Domain } from "./components/domain";

const DomainPage = () => {
	return <Domain />;
};

export default DomainPage;
