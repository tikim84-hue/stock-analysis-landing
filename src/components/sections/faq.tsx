import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const ITEMS = [
  {
    q: "어떤 데이터를 입력해야 하나요?",
    a: "처분이 완료된 거래의 종목코드, 종목명, 매수 단가, 수량, 매수일, 매도일, 매도 총액 7가지면 충분합니다. 수수료와 증권거래세는 한국 시장 평균치로 자동 계산되고, 실제 영수증 값으로 덮어쓰는 것도 가능합니다.",
  },
  {
    q: "분석 정확도는 어느 정도인가요?",
    a: "TWR/MWR, 알파, 샤프, MDD 모두 자산운용 업계 표준 공식 그대로 계산합니다. 입력 데이터가 정확하다면 증권사 리포트와 동일한 값이 나옵니다. 수수료·세금은 한국 평균치를 가정하므로 실제와 차이가 있을 수 있습니다.",
  },
  {
    q: "데이터는 안전한가요?",
    a: "모든 거래내역은 Supabase에 사용자별 행 단위 보안(RLS)이 적용된 채 저장됩니다. 본인 계정으로 로그인한 경우에만 본인 데이터에 접근할 수 있고, 다른 사용자나 운영자가 임의로 읽거나 수정할 수 없습니다.",
  },
  {
    q: "해외 주식도 분석되나요?",
    a: "원/달러 환율 처리와 미국 시장 수수료 체계가 다르기 때문에 현재는 국내 주식만 지원합니다. 해외 종목 지원과 S&P500·NASDAQ 벤치마크 비교는 다음 업데이트에 포함될 예정입니다.",
  },
  {
    q: "비용은 얼마인가요?",
    a: "현재는 기능 검증을 위한 무료 베타 단계입니다. 추후 유료 플랜이 도입되더라도 본인이 입력한 거래내역과 분석 결과는 그대로 본인 소유로 유지됩니다.",
  },
  {
    q: "차익실현 매도가 아닌 보유 종목도 포함되나요?",
    a: "현재 분석 대상은 매도까지 완료된 실현 거래입니다. 평가손익이 잡힌 보유 포지션을 포함하는 \"미실현 손익\" 분석은 다음 업데이트로 추가됩니다.",
  },
];

export function Faq() {
  return (
    <section
      id="faq"
      className="relative border-t border-border/40 py-24 md:py-32"
    >
      <div className="mx-auto max-w-3xl px-6">
        <div className="mb-10">
          <p className="text-sm font-medium uppercase tracking-widest text-highlight">
            FAQ
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
            자주 묻는 질문
          </h2>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {ITEMS.map((item, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger>{item.q}</AccordionTrigger>
              <AccordionContent>{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
