import { SiteHeader } from "@/components/nav/site-header";
import { Hero } from "@/components/sections/hero";
import { PainPoints } from "@/components/sections/pain-points";
// TODO: 다음 섹션 파일이 아직 만들어지지 않아 임시로 비활성화했습니다.
// 실제 파일이 생기면 import와 JSX를 함께 복원하세요.
// import { MetricsPreview } from "@/components/sections/metrics-preview";
// import { BenchmarkAttribution } from "@/components/sections/benchmark-attribution";
// import { RiskCost } from "@/components/sections/risk-cost";
import { HowItWorks } from "@/components/sections/how-it-works";
import { TradeHistory } from "@/components/sections/trade-history";
// import { Faq } from "@/components/sections/faq";
// import { SiteFooter } from "@/components/sections/site-footer";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main id="top" className="flex-1">
        <Hero />
        <PainPoints />
        {/* <MetricsPreview /> */}
        {/* <BenchmarkAttribution /> */}
        {/* <RiskCost /> */}
        <HowItWorks />
        <TradeHistory />
        {/* <Faq /> */}
      </main>
      {/* <SiteFooter /> */}
    </>
  );
}
