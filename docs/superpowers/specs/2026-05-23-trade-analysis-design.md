# 매매일지 분석 차트 — 설계 문서

**작성일:** 2026-05-23
**대상 기능:** 매매일지 섹션 내 차트 시각화(누적 손익 곡선 + 종목별 손익 막대) 탭 추가

## 1. 목적과 범위

매매일지 섹션에 분석 탭을 추가해, 사용자가 자기 거래 데이터를 시각적으로 파악할 수 있게 한다. 텍스트 표만으로는 보이지 않는 두 가지 패턴을 보여주는 것이 목표다.

- **누적 손익이 시간에 따라 어떻게 변했는가** (실현 자산곡선)
- **어느 종목이 손익에 가장 크게 기여했는가** (종목별 기여도)

다음은 명시적으로 **범위 밖**이다.

- 통계 지표(승률·MDD·샤프지수 등)
- 보유기간 분석, 월별 분석
- AI 자연어 인사이트
- 별도 `/analysis` 페이지
- 차트 데이터 필터(기간/종목 선택)

위 항목은 별도 후속 스펙이 필요할 경우에만 다룬다.

## 2. UI 구조

### 배치

`TradeHistory` 섹션 내부를 다음과 같이 재구성한다.

```
┌── Trade history ──────────────────────────────┐
│  헤더 (제목·설명·우상단 액션 버튼)             │
│                                                │
│  SummaryCard × 3  (건수 / 총손익 / 평균수익률)  │
│                                                │
│  [내역]  [분석]   ← Radix Tabs                 │
│  ─────────────────────────────────────────    │
│                                                │
│  (선택된 탭의 컨텐츠)                          │
└────────────────────────────────────────────────┘
```

- 요약 카드 3개는 두 탭 모두에 공통이라 탭 위에 항상 표시한다.
- 우상단 액션 버튼(`초기화`, `거래 추가`)은 "내역" 탭이 활성화된 동안만 표시한다(분석 탭에서는 의미가 없으므로 숨김).
- 인증 게이트(로그아웃 시 "로그인 / 회원가입" 안내)는 현재 동작 그대로 유지하며, 탭 자체가 게이트 통과 후에만 렌더된다.

### 탭 컨텐츠

**내역 탭**: 현재 `TradeHistory`에 있는 폼(`TradeHistoryForm`) + 거래 테이블 + 하단 주석. 외형/동작은 변하지 않는다.

**분석 탭**: 두 차트를 세로로 배치한다.

```
┌── 누적 손익 곡선 ─────────────────┐
│                                    │
│   (Line chart, h-280px)            │
│                                    │
└────────────────────────────────────┘

┌── 종목별 손익 ────────────────────┐
│                                    │
│   (Bar chart, h-280px)             │
│                                    │
└────────────────────────────────────┘
```

각 차트는 `Card`처럼 보이는 컨테이너(`rounded-lg border border-border/40 bg-card/40 p-6`)로 감싸고, 상단에 한 줄 제목을 둔다.

## 3. 파일 구조

```
src/components/sections/trade-history.tsx        (리팩토 — 탭 오케스트레이터)
src/components/sections/trade-history-table.tsx  (신규 — 기존 폼/테이블 분리)
src/components/sections/trade-analytics.tsx      (신규 — 분석 탭 컨테이너)
src/components/sections/equity-curve-chart.tsx   (신규 — Line chart)
src/components/sections/pnl-by-ticker-chart.tsx  (신규 — Bar chart)
src/lib/analytics.ts                             (신규 — 순수 집계 함수)
```

차트 두 개를 한 파일에 합치지 않고 따로 두는 이유: 각 차트가 자체 데이터 변형·tooltip·축 포맷을 갖기 때문에 한 파일이 빠르게 비대해진다. 분리하면 한 파일이 한 차트만 책임진다.

### 컴포넌트 책임

- **`trade-history.tsx`**: `useTrades`로 데이터 로드, `useAuth`로 인증 상태 확인, 요약 카드 계산, `Tabs` 상태 관리, 자식 컴포넌트에 `trades` 전달. 자체 렌더링은 헤더/카드/탭 셸까지만.
- **`trade-history-table.tsx`**: 폼 모드 상태(`create`/`edit`/`closed`)와 테이블 렌더링. 부모로부터 `trades`, `addTrade`, `updateTrade`, `removeTrade`를 props로 받는다.
- **`trade-analytics.tsx`**: `trades`를 받아 비어있으면 안내 메시지, 있으면 두 차트를 렌더.
- **`equity-curve-chart.tsx` / `pnl-by-ticker-chart.tsx`**: `analytics.ts`의 결과를 받아 Recharts로 시각화. 차트 라이브러리에 직접 의존하는 유일한 두 파일.

## 4. 데이터 흐름

`useTrades`는 부모(`TradeHistory`) 한 곳에서만 호출한다. 두 탭이 같은 데이터를 봐야 하므로 자식이 각자 다시 호출하지 않는다.

분석 데이터는 `src/lib/analytics.ts`에 순수 함수 두 개로 둔다.

```ts
// 처분일 오름차순 정렬 후 PnL 누적
export function buildEquityCurve(trades: Trade[]): EquityPoint[];

// ticker 기준 그룹화, 그룹별 PnL 합계, |PnL| 내림차순 정렬
export function buildPnlByTicker(trades: Trade[]): TickerPnl[];

export type EquityPoint = { date: string; cumulativePnl: number };
export type TickerPnl = { ticker: string; name: string; pnl: number };
```

두 함수 모두 내부에서 `computeDerived`를 호출해 PnL을 얻는다. 파생값을 별도로 저장하지 않는다는 기존 규칙(CLAUDE.md)을 그대로 따른다.

차트 컴포넌트는 `useMemo`로 변형된 배열을 메모이즈한다. `trades`가 바뀔 때만 재계산된다.

## 5. 차트 디자인

### 누적 손익 곡선 (Recharts `LineChart`)

- X축: 처분일(`sellDate`), 시간 순으로 표시. 라벨은 `YY-MM-DD` 포맷(거래가 여러 해에 걸치는 경우 연도 식별 필요).
- Y축: 누적 실현손익(원). 천 단위 콤마.
- 선 색상: 최종 누적값이 양수면 `var(--up)`, 음수면 `var(--down)`, 0이면 `var(--muted-foreground)`.
- 0 기준선을 점선(`strokeDasharray="3 3"`)으로 표시.
- Tooltip은 한국어, 통화 포맷 사용(`formatSignedCurrency` 재사용).
- `ResponsiveContainer width="100%" height={280}`.

### 종목별 손익 막대 (Recharts `BarChart`)

- X축: 종목명(`name`). 종목이 많을 경우 자동 회전.
- Y축: PnL(원).
- 막대 색: 각 막대가 자기 PnL 부호에 따라 `var(--up)` 또는 `var(--down)`. Recharts의 `Cell` 컴포넌트로 처리.
- 정렬: `|pnl|` 내림차순(영향 큰 종목 먼저).
- Tooltip에 ticker, 손익(서명 포함) 표시.
- `ResponsiveContainer width="100%" height={280}`.

색상은 Recharts의 `stroke`/`fill` 프로퍼티에 CSS 변수를 직접 전달한다(예: `stroke="var(--up)"`). `globals.css`의 `--up`/`--down`은 HEX 값으로 정의돼 있으므로 `hsl()` 래핑 없이 그대로 쓴다.

## 6. 엣지 케이스

| 상황 | 동작 |
|---|---|
| 로그아웃 | 기존 auth gate가 섹션 전체를 가림. 탭 자체가 보이지 않음. |
| 거래 0건 (로그인 직후) | "내역" 탭은 현재의 빈 메시지 유지. "분석" 탭은 "거래를 1건 이상 입력하면 차트가 표시됩니다" 안내 박스, 차트 미렌더. |
| 거래 1건 | Equity curve는 점 1개로 표시. Bar chart는 막대 1개. 둘 다 정상 동작. |
| 같은 ticker 다수 거래 | 종목별 차트에서 ticker 기준으로 합산. Equity curve는 각 처분일마다 별개 데이터 포인트로 누적. |
| `trades` 로딩 중(`isHydrated=false`) | "내역" 탭은 현재의 "불러오는 중…" 메시지 유지. "분석" 탭은 동일한 스켈레톤 메시지. |

## 7. 변경하지 않는 것

- `useTrades`, `trades.ts`, Supabase 스키마, RLS — 손대지 않는다.
- `computeDerived`의 시그니처와 동작 — 파생값 계산 단일 진실 원천 그대로.
- 거래 추가/수정/삭제 플로우.
- 요약 카드 3개의 계산 로직과 색상 규칙.
- 한국 시장 색상 컨벤션(`--up=red`, `--down=blue`).

## 8. 의존성

추가 설치 없음.

- `recharts@^3.8.1` — 이미 설치됨.
- `@radix-ui/react-tabs@^1.1.13` — 이미 설치됨, `src/components/ui/tabs.tsx` 래퍼 존재.

## 9. 수용 기준

- 로그인 사용자가 매매일지 섹션에서 "내역"과 "분석" 탭을 전환할 수 있다.
- "내역" 탭의 외형·동작이 변경 전과 동일하다(폼·테이블·삭제 확인·초기화 모두).
- "분석" 탭에서 누적 손익 곡선과 종목별 손익 막대 두 차트가 보인다.
- 거래가 없거나 로딩 중일 때 분석 탭이 깨지지 않고 안내 메시지를 표시한다.
- 차트 색상이 한국 시장 컨벤션(양수=빨강, 음수=파랑)을 따른다.
- `npm run build`가 통과한다.
