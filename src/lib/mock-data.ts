export type SeriesPoint = {
  month: string;
  portfolio: number;
  kospi: number;
  sp500: number;
};

export const portfolioVsBenchmark: SeriesPoint[] = [
  { month: "2024-05", portfolio: 100, kospi: 100, sp500: 100 },
  { month: "2024-06", portfolio: 103.2, kospi: 101.4, sp500: 102.1 },
  { month: "2024-07", portfolio: 106.1, kospi: 99.8, sp500: 103.4 },
  { month: "2024-08", portfolio: 109.4, kospi: 98.2, sp500: 104.8 },
  { month: "2024-09", portfolio: 108.7, kospi: 97.5, sp500: 105.2 },
  { month: "2024-10", portfolio: 113.5, kospi: 99.1, sp500: 107.0 },
  { month: "2024-11", portfolio: 117.8, kospi: 100.3, sp500: 109.6 },
  { month: "2024-12", portfolio: 119.2, kospi: 101.7, sp500: 111.3 },
  { month: "2025-01", portfolio: 116.4, kospi: 100.1, sp500: 110.2 },
  { month: "2025-02", portfolio: 121.5, kospi: 102.4, sp500: 112.5 },
  { month: "2025-03", portfolio: 122.8, kospi: 102.9, sp500: 113.8 },
  { month: "2025-04", portfolio: 124.3, kospi: 103.7, sp500: 115.1 },
];

export const heroSparkline = portfolioVsBenchmark.map((p) => ({
  month: p.month,
  portfolio: p.portfolio,
  kospi: p.kospi,
}));

export type Kpi = {
  id: string;
  label: string;
  value: string;
  delta?: string;
  direction: "up" | "down" | "neutral";
  description: string;
  spark: number[];
};

export const kpis: Kpi[] = [
  {
    id: "twr",
    label: "TWR (시간가중수익률)",
    value: "+24.3%",
    delta: "vs 1Y 전",
    direction: "up",
    description:
      "입출금 타이밍 영향을 제거한 순수 운용 성과. 포트폴리오 매니저 성과 평가의 표준 지표입니다.",
    spark: [100, 102, 105, 108, 107, 112, 116, 118, 116, 120, 122, 124],
  },
  {
    id: "mwr",
    label: "MWR / IRR (금액가중)",
    value: "+18.7%",
    delta: "현금흐름 반영",
    direction: "up",
    description:
      "추가 매수·매도 시점까지 반영한 실제 자금 수익률. 내 돈이 진짜 얼마나 일했는지를 봅니다.",
    spark: [100, 101, 103, 106, 109, 110, 113, 115, 114, 117, 118, 119],
  },
  {
    id: "alpha",
    label: "vs KOSPI 알파",
    value: "+9.2%p",
    delta: "벤치마크 초과",
    direction: "up",
    description:
      "KOSPI 대비 초과 수익률. 시장 베타가 아닌 종목 선정·타이밍에서 만든 진짜 알파를 측정합니다.",
    spark: [0, 1.8, 3.4, 5.1, 5.8, 7.2, 8.0, 8.6, 8.1, 8.9, 9.0, 9.2],
  },
  {
    id: "sharpe",
    label: "샤프 지수",
    value: "1.42",
    delta: "리스크 조정",
    direction: "up",
    description:
      "변동성 1단위당 초과수익. 1.0 이상이면 양호, 1.5 이상이면 우수한 것으로 간주됩니다.",
    spark: [0.8, 0.9, 1.0, 1.1, 1.05, 1.15, 1.25, 1.32, 1.28, 1.36, 1.4, 1.42],
  },
  {
    id: "mdd",
    label: "MDD (최대낙폭)",
    value: "-12.4%",
    delta: "회복 47일",
    direction: "down",
    description:
      "고점 대비 가장 컸던 낙폭과 회복 기간. 리스크 감내 한계와 전략 강건성을 점검합니다.",
    spark: [0, -2, -4, -6, -9, -12.4, -10, -7, -4, -2, -1, 0],
  },
  {
    id: "winrate",
    label: "승률 / 손익비",
    value: "58% · 2.1R",
    delta: "62회 매매 기준",
    direction: "up",
    description:
      "승률만 높아도, 손익비만 좋아도 부족합니다. 두 지표를 함께 봐야 매매 시스템의 기대값이 보입니다.",
    spark: [50, 52, 55, 53, 56, 57, 56, 58, 57, 59, 58, 58],
  },
];

export type SectorContribution = {
  sector: string;
  contribution: number;
};

export const sectorAttribution: SectorContribution[] = [
  { sector: "반도체", contribution: 4.2 },
  { sector: "헬스케어", contribution: 2.1 },
  { sector: "AI·소프트웨어", contribution: 1.8 },
  { sector: "금융", contribution: 0.6 },
  { sector: "소비재", contribution: -0.4 },
  { sector: "에너지", contribution: -0.9 },
  { sector: "2차전지", contribution: -1.8 },
];

export type ContributorRow = {
  ticker: string;
  name: string;
  weight: number;
  ret: number;
  contribution: number;
};

export const topContributors: ContributorRow[] = [
  { ticker: "005930", name: "삼성전자", weight: 14.2, ret: 28.4, contribution: 4.0 },
  { ticker: "000660", name: "SK하이닉스", weight: 8.5, ret: 41.2, contribution: 3.5 },
  { ticker: "NVDA", name: "엔비디아", weight: 6.1, ret: 52.6, contribution: 3.2 },
  { ticker: "207940", name: "삼성바이오로직스", weight: 5.8, ret: 22.1, contribution: 1.3 },
  { ticker: "MSFT", name: "마이크로소프트", weight: 5.0, ret: 18.7, contribution: 0.9 },
];

export const bottomContributors: ContributorRow[] = [
  { ticker: "373220", name: "LG에너지솔루션", weight: 6.4, ret: -22.8, contribution: -1.5 },
  { ticker: "051910", name: "LG화학", weight: 4.2, ret: -18.4, contribution: -0.8 },
  { ticker: "247540", name: "에코프로비엠", weight: 3.1, ret: -16.2, contribution: -0.5 },
  { ticker: "XOM", name: "엑손모빌", weight: 3.5, ret: -12.0, contribution: -0.4 },
  { ticker: "035420", name: "NAVER", weight: 4.8, ret: -8.4, contribution: -0.4 },
];

export type DrawdownPoint = { month: string; drawdown: number };

export const drawdownCurve: DrawdownPoint[] = [
  { month: "2024-05", drawdown: 0 },
  { month: "2024-06", drawdown: -1.2 },
  { month: "2024-07", drawdown: -2.4 },
  { month: "2024-08", drawdown: -0.3 },
  { month: "2024-09", drawdown: -3.6 },
  { month: "2024-10", drawdown: 0 },
  { month: "2024-11", drawdown: 0 },
  { month: "2024-12", drawdown: -0.8 },
  { month: "2025-01", drawdown: -12.4 },
  { month: "2025-02", drawdown: -7.5 },
  { month: "2025-03", drawdown: -3.0 },
  { month: "2025-04", drawdown: 0 },
];

export type CostItem = {
  label: string;
  pct: number;
  description: string;
};

export const costBreakdown: CostItem[] = [
  {
    label: "거래수수료 + 유관기관세",
    pct: 18,
    description: "매매 회전율이 높을수록 누적되는 고정 비용.",
  },
  {
    label: "양도세 + 배당세",
    pct: 32,
    description: "해외주식 양도세, 국내 배당소득세, 분리과세 합산.",
  },
  {
    label: "환전 스프레드",
    pct: 22,
    description: "달러 환전 시 매도/매수 호가 차이. 해외주식 비중 클수록 누적.",
  },
  {
    label: "슬리피지 추정",
    pct: 12,
    description: "체결가와 의도가 사이의 차이. 거래량 대비 호가창 두께로 추정.",
  },
];

export type FaqItem = { q: string; a: string };

export const faqs: FaqItem[] = [
  {
    q: "TWR과 MWR 중 어느 쪽이 더 정확한가요?",
    a: "용도가 다릅니다. TWR은 운용 능력 자체를, MWR은 내 자금이 실제로 만들어낸 수익을 봅니다. 적립식·분할매수가 잦다면 두 값의 차이를 함께 보는 것이 가장 정확합니다.",
  },
  {
    q: "해외주식 환율 변동도 반영되나요?",
    a: "네. 매수일·매도일 환율과 보유 기간 중 환율 변동을 분리해서 환차익/환차손을 별도 라인으로 계산합니다. 원화 기준 수익률과 현지통화 수익률을 모두 표시합니다.",
  },
  {
    q: "단기 매매(스캘핑)에도 유의미한 분석이 나오나요?",
    a: "거래 회수가 30회를 넘으면 승률·손익비·기대값(Expectancy)이 통계적으로 의미를 갖기 시작합니다. 시간대·요일·종목군별로 매매 패턴을 쪼개서 어디서 알파가 나오는지 보여줍니다.",
  },
  {
    q: "벤치마크는 어떻게 선택하나요?",
    a: "기본은 KOSPI·KOSDAQ·S&P500이며, 보유 종목 구성에 따라 자동으로 가중 합성 벤치마크를 제안합니다. 사용자가 임의 ETF를 벤치마크로 지정할 수도 있습니다.",
  },
  {
    q: "데이터는 어디에 저장되나요?",
    a: "거래내역 CSV는 브라우저 내에서만 처리되는 클라이언트 사이드 데모입니다. 서버로 전송되지 않으며, 새로고침 시 모두 삭제됩니다.",
  },
];
