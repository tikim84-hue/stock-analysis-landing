# stock-analysis-landing

액티브 개인 투자자를 위한 **주식 매매 성과 분석** 랜딩 페이지. 정적 마케팅 섹션 + 로그인 후 사용하는 인터랙티브 매매일지(거래 입력 + 분석 차트 4종) + AI 방명록까지 한 페이지에 모았습니다.

Next.js 16 App Router + React 19 + TypeScript + Tailwind CSS v4 + Supabase + Recharts.

**프로덕션:** https://stock-analysis-landing-six.vercel.app

## 주요 섹션

| 섹션 | 설명 |
|---|---|
| **Hero** | 핵심 가치 제안 + 12개월 포트폴리오 vs KOSPI 미니 차트 |
| **Pain Points** | 액티브 투자자가 겪는 분석 페인 포인트 3가지 |
| **Metrics preview** | TWR · MWR · 알파 · 샤프 · MDD 5개 지표 미리보기 카드 |
| **Benchmark attribution** | 시장 베타 vs 알파 분해 시각화 |
| **Risk & cost** | 샤프지수 · MDD · 수수료/세금 누수 3개 카드 |
| **How it works** | CSV 업로드 → 자동 정규화 → 인터랙티브 리포트 3단계 |
| **Trade history** ⭐ | **로그인 후 매매내역을 직접 입력하면 실현 손익·수익률과 4종 분석 차트를 자동 계산** |
| **Guestbook** | OpenRouter 기반 AI 방명록 (로그인 필요, 사용자당 분당 20회 rate limit) |
| **Faq** | 자주 묻는 질문 6개 |
| **Footer** | 섹션 네비게이션 + 카피라이트 |

## Trade history 섹션

로그인 사용자가 처분이 끝난 거래를 입력하면 한국 시장 표준 수수료·세금을 자동 차감해 **실현 손익**과 **수익률**을 계산합니다. 모든 거래내역은 **Supabase**에 사용자별 행 단위 보안(RLS)으로 저장되며 본인 계정으로만 접근 가능합니다. 비로그인 상태에서는 "로그인 / 회원가입" 안내 카드가 표시됩니다.

섹션은 두 개의 탭으로 구성됩니다.

### 내역 탭 — 입력·관리

`주가코드` · `이름` · `구입가` · `수량` · `구입일` · `처분일` · `처분금액` · `수수료` · `증권거래세` · `거래차액` · `수익률` 11개 데이터 컬럼 + 수정/삭제 액션.

```
매수원금   = 구입가 × 수량
수수료     ≈ (매수원금 + 처분금액) × 0.00015     // 양방향 0.015%
증권거래세 ≈ 처분금액 × 0.0018                  // 코스피·코스닥 합산 0.18%
거래차액   = 처분금액 − 매수원금 − 수수료 − 증권거래세
수익률(%)  = 거래차액 / 매수원금 × 100
```

수수료·증권거래세는 폼에서 "자동" 토글을 해제하면 직접 입력할 수 있습니다(영수증 기준 정확값 입력용). `거래차액`·`수익률`은 절대 저장되지 않고 항상 위 공식으로 파생됩니다.

**CRUD**

- **추가**: 헤더의 "거래 추가" 버튼 → 인라인 폼
- **수정**: 행 우측 ✏️ 버튼
- **삭제**: 행 우측 🗑️ 버튼 (확인창)
- **초기화**: "초기화" 버튼 — 본인의 모든 행 삭제 후 시드 3건(삼성전자·카카오·SK하이닉스)으로 복원 (per-user)

### 분석 탭 — 차트 4종

같은 거래 데이터를 시각화. 모두 Recharts 기반, 한국 시장 컨벤션(빨강=수익, 파랑=손실)을 따릅니다.

| 차트 | 설명 |
|---|---|
| 누적 손익 곡선 | 처분일 순으로 PnL을 누적, 종료 시점 부호로 라인 색상 결정 |
| 종목별 손익 | 종목별 PnL 합계, `|PnL|` 내림차순, 막대마다 부호 색상 |
| 월별 실현 손익 | 처분월(`YYYY-MM`) 그룹화, 시간순 |
| 보유기간 vs 수익률 | 산점도: X = 보유일수, Y = 수익률, 점은 부호별로 두 series로 색 구분 |

## 기술 스택

- **Next.js** 16.2.6 (App Router, Turbopack, `proxy.ts` 미들웨어)
- **React** 19.2.4
- **TypeScript** 5
- **Tailwind CSS** v4 (`@theme inline` 토큰)
- **Supabase** — Auth + Postgres (`@supabase/ssr`), per-user RLS
- **OpenRouter** — AI 방명록 LLM 호출(`anthropic/claude-3.5-haiku` 기본)
- **Recharts** 3.8 — 차트 시각화
- **Radix UI** — accordion, dialog, progress, tabs, tooltip
- **lucide-react** — 아이콘
- **Pretendard** — 한글 가변 폰트 (CDN)

## 시작하기

```bash
npm install
npm run dev   # http://localhost:3000
```

`.env.local`에 다음 환경 변수 필요:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
OPENROUTER_API_KEY=
OPENROUTER_MODEL=  # (선택, 기본 anthropic/claude-3.5-haiku)
```

### 그 외 명령

```bash
npm run build   # 프로덕션 빌드 (전체 TypeScript 타입체크 포함)
npm run start   # 빌드 결과 실행
npm run lint    # ESLint (flat config)
```

테스트 러너는 설정돼 있지 않습니다.

## 폴더 구조

```
src/
├─ app/
│  ├─ layout.tsx                  # RootLayout, AuthProvider, Pretendard
│  ├─ page.tsx                    # 9개 섹션 + Footer 조립
│  ├─ globals.css                 # Tailwind v4 + --up/--down/--highlight 토큰
│  ├─ api/ai/route.ts             # AI 방명록 API: auth 게이트 + rate limit + OpenRouter
│  └─ auth/callback/route.ts      # Supabase OAuth/이메일 콜백 (safeNext 가드)
├─ proxy.ts                       # Next.js 16 미들웨어 (Supabase 세션 갱신용 부수효과)
├─ components/
│  ├─ nav/site-header.tsx
│  ├─ auth/                       # AuthProvider, AuthDialog (signIn/signUp)
│  ├─ sections/
│  │  ├─ hero, pain-points, metrics-preview,
│  │  ├─ benchmark-attribution, risk-cost, how-it-works,
│  │  ├─ trade-history.tsx        # 탭 오케스트레이터 (useTrades + useAuth)
│  │  ├─ trade-history-table.tsx  # 내역 탭: 폼 + 12컬럼 테이블
│  │  ├─ trade-analytics.tsx      # 분석 탭: 차트 컴포넌트 조립
│  │  ├─ equity-curve-chart.tsx
│  │  ├─ pnl-by-ticker-chart.tsx
│  │  ├─ monthly-pnl-chart.tsx
│  │  ├─ holding-return-scatter.tsx
│  │  ├─ trade-history-form.tsx   # 추가/수정 인라인 폼
│  │  ├─ guestbook.tsx
│  │  ├─ faq.tsx
│  │  └─ site-footer.tsx
│  ├─ charts/                     # 데코레이션 차트 5종 (hero 등에서 사용, mock 데이터)
│  └─ ui/                         # shadcn 스타일 프리미티브
└─ lib/
   ├─ supabase/
   │  ├─ client.ts                # createBrowserClient
   │  ├─ server.ts                # createServerClient
   │  └─ proxy.ts                 # updateSession (세션 토큰 갱신)
   ├─ trades.ts                   # Trade 타입, computeDerived, 시드, 포맷터
   ├─ analytics.ts                # 분석 탭 차트용 순수 함수 4종
   ├─ use-trades.ts               # Supabase trades 테이블 hook
   ├─ use-chat.ts                 # Supabase messages 테이블 hook (AI 방명록)
   ├─ mock-data.ts                # 데코 차트용 목 데이터
   └─ utils.ts                    # cn() 유틸
```

## 디자인 토큰

`globals.css`에 한국식 **빨강=상승 / 파랑=하락** 색상 체계가 CSS 변수로 정의돼 있습니다.

```css
--up:        #ef4444   /* 수익(+) */
--down:      #3b82f6   /* 손실(−) */
--highlight: #a78bfa   /* 강조 */
```

Tailwind에서 `text-up`, `text-down`, `bg-highlight/15` 같이 사용합니다. Recharts에는 `stroke="var(--up)"` 형태로 직접 전달.

## 배포

[Vercel](https://vercel.com)에 GitHub 연동으로 자동 배포됩니다. `main` 브랜치 푸시 시 자동 빌드. 안정 alias: https://stock-analysis-landing-six.vercel.app

Deployment Protection은 CLI로 토글 가능: `vercel project protection [enable|disable] stock-analysis-landing --sso`. 더 자세한 운영 메모는 `CLAUDE.md` 참조.

빌드 시 주의 — Next.js는 `next build`에서 전체 TypeScript 타입체크를 실행합니다. ESLint(`npm run lint`)만 통과해도 `next build`가 실패할 수 있으니, 푸시 전 로컬에서 `npm run build`를 한 번 돌려보길 권장합니다.

## 라이선스

Private (학습·실습 용도).
