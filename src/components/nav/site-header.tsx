import { LineChart } from "lucide-react";
import { AuthButton } from "@/components/auth/auth-button";

const NAV_ITEMS = [
  { href: "#metrics", label: "핵심 지표" },
  { href: "#benchmark", label: "벤치마크" },
  { href: "#risk", label: "리스크·비용" },
  { href: "#how-it-works", label: "동작 방식" },
  { href: "#faq", label: "FAQ" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/70 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <a href="#top" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-highlight/15 text-highlight">
            <LineChart className="h-4 w-4" />
          </span>
          <span className="text-sm font-semibold tracking-tight">
            주식투자수익분석
          </span>
        </a>
        <nav className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
            >
              {item.label}
            </a>
          ))}
        </nav>
        <AuthButton />
      </div>
    </header>
  );
}
