import { LineChart } from "lucide-react";

const SECTIONS = [
  { label: "지표 미리보기", href: "#metrics-preview" },
  { label: "벤치마크 분해", href: "#benchmark-attribution" },
  { label: "리스크·비용", href: "#risk-cost" },
  { label: "분석 절차", href: "#how-it-works" },
  { label: "매매일지", href: "#trade-history" },
  { label: "FAQ", href: "#faq" },
];

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-border/40 bg-background/60 py-12">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-highlight/15 text-highlight">
                <LineChart className="h-4 w-4" />
              </span>
              <span className="text-sm font-semibold">Stock Analysis</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              액티브 개인 투자자를 위한 매매 성과 분석 도구. 시장 베타와 알파를 분리해
              실력에 기반한 의사결정을 돕습니다.
            </p>
          </div>

          <nav aria-label="페이지 섹션" className="grid grid-cols-2 gap-x-10 gap-y-2 text-sm">
            {SECTIONS.map((s) => (
              <a
                key={s.href}
                href={s.href}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                {s.label}
              </a>
            ))}
          </nav>
        </div>

        <div className="mt-10 border-t border-border/40 pt-6 text-xs text-muted-foreground/80">
          © {year} Stock Analysis · 본 서비스는 투자 자문이 아닙니다. 모든 분석은 사용자가
          입력한 거래내역에 기반한 참고용 정보입니다.
        </div>
      </div>
    </footer>
  );
}
