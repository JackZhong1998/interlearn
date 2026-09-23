import { Feed } from "@/components/Feed";
import { loadCatalog } from "@/lib/catalog";

export default function HomePage() {
  const series = loadCatalog();
  return <Feed series={series} />;
}
