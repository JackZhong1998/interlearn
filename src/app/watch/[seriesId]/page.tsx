import { notFound } from "next/navigation";
import { findSeries } from "@/lib/catalog";
import { LEARNING_SLUGS } from "@/data/bundled-series";
import { TEACHERS } from "@/data/teachers";
import { WatchPlayer } from "@/components/WatchPlayer";

export function generateStaticParams() {
  return LEARNING_SLUGS.map((seriesId) => ({ seriesId }));
}

export default async function WatchPage({
  params,
}: {
  params: Promise<{ seriesId: string }>;
}) {
  const { seriesId } = await params;
  const series = findSeries(seriesId);
  if (!series) notFound();
  return <WatchPlayer series={series} teachers={TEACHERS} startEnded={false} />;
}
