import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid h-dvh place-items-center px-6 text-center">
      <div>
        <div className="text-lg font-semibold">没有这条</div>
        <Link href="/" className="mt-3 inline-block text-sm text-white/70">
          回首页
        </Link>
      </div>
    </div>
  );
}
