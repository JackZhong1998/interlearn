"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LearnCustomRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/create");
  }, [router]);
  return <div className="grid h-dvh place-items-center text-sm text-white/50">转到定制学习…</div>;
}
