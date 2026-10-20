import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CommunityShell } from "@/components/CommunityShell";
import { community, communityBuilds } from "@/lib/data";

export const dynamicParams = false;

export function generateStaticParams() {
  return community.modes.map((m) => ({ mode: m.slug }));
}

function findMode(mode: string) {
  return community.modes.find((m) => m.slug === mode);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ mode: string }>;
}): Promise<Metadata> {
  const { mode } = await params;
  const label = findMode(mode)?.label;
  if (!label) return { title: "Топ билдов Albion Online" };
  return {
    title: `${label} — топ билдов Albion Online`,
    description: `Лучшие билды для режима «${label}» по голосам сообщества albiononlinebuilds.com: состав экипировки и популярные сборки.`,
  };
}

export default async function Builds2ModePage({
  params,
}: {
  params: Promise<{ mode: string }>;
}) {
  const { mode } = await params;
  if (!findMode(mode)) notFound();
  const builds = communityBuilds.filter((b) => b.modes.includes(mode));
  return <CommunityShell builds={builds} active={mode} />;
}
