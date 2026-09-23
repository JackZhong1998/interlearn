"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "首页", icon: HomeIcon },
  { href: "/create", label: "定制学习", icon: CreateIcon },
  { href: "/me", label: "我的", icon: MeIcon },
];

export function TabBar() {
  const pathname = usePathname();
  return (
    <nav className="pointer-events-none absolute inset-x-0 bottom-0 z-40">
      <div className="mx-auto flex max-w-[430px] items-end justify-around bg-gradient-to-t from-black/90 via-black/70 to-transparent px-4 pb-[max(10px,env(safe-area-inset-bottom))] pt-6">
        {TABS.map((tab) => {
          const active =
            tab.href === "/"
              ? pathname === "/"
              : pathname.startsWith(tab.href);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`pointer-events-auto flex w-20 flex-col items-center gap-0.5 py-1 text-[11px] ${
                active ? "text-white" : "text-white/45"
              }`}
            >
              <Icon active={active} />
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8">
      <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z" />
    </svg>
  );
}
function CreateIcon({ active }: { active: boolean }) {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.7}>
      <rect x="3" y="3" width="18" height="18" rx="6" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  );
}
function MeIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5 19c1.2-3 3.6-4.5 7-4.5s5.8 1.5 7 4.5" />
    </svg>
  );
}
