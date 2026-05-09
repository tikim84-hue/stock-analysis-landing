import { Card, CardContent } from "@/components/ui/card";
import { FileSpreadsheet, LineChart, PieChart } from "lucide-react";

const PAINS = [
  {
    icon: FileSpreadsheet,
    title: "엑셀 매매일지, 결국 포기하셨죠?",
    body:
      "매매할 때마다 손으로 입력하고, 환율·수수료를 일일이 계산하다 보면 한 달도 못 갑니다. 분석은커녕 기록조차 끊기죠.",
  },
  {
    icon: LineChart,
    title: "이 수익률이 진짜인지, 시장 덕인지 모르겠다",
    body:
      "포트폴리오 +24%가 좋은 건지 알 수 없습니다. 같은 기간 KOSPI는? 같은 종목군 ETF는? 비교가 없으면 평가도 없습니다.",
  },
  {
    icon: PieChart,
    title: "어디서 알파가, 어디서 누수가 났는지 안 보인다",
    body:
      "수익이 났어도 어떤 섹터·종목·매매 패턴이 만든 건지 모르면 다음에 재현할 수 없습니다. 손실도 마찬가지입니다.",
  },
];

export function PainPoints() {
  return (
    <section className="relative border-t border-border/40 bg-background py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-14 max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-widest text-highlight">
            Pain Points
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
            이런 고민, 익숙하시죠?
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            매매 횟수가 늘수록 직관만으로는 성과 평가가 어렵습니다. 자주
            마주치는 세 가지 막힘 지점을 정리했습니다.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {PAINS.map((p) => (
            <Card key={p.title} className="transition-colors hover:border-border">
              <CardContent className="pt-6">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-muted/60 text-highlight">
                  <p.icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold leading-snug">{p.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {p.body}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
