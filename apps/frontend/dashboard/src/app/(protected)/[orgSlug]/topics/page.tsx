"use client";

import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import { redirect } from "next/navigation";

const TopicsPage = () => {
  const { activeOrganization } = useUserOrganization();
  redirect(`/${activeOrganization.slug}/contacts?tab=topics`);
};

export default TopicsPage;
