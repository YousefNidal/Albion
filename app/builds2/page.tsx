import type { Metadata } from "next";
import { CommunityShell } from "@/components/CommunityShell";
import { communityBuilds } from "@/lib/data";

export const metadata: Metadata = {
  title: "Топ билдов Albion Online",
  description:
    "Лучшие билды Albion Online по голосам сообщества albiononlinebuilds.com: Мисты, хеллгейты, ганк, PvE и Ancient Lands — с составом экипировки.",
};

export default function Builds2Page() {
  return <CommunityShell builds={communityBuilds} active="all" />;
}
