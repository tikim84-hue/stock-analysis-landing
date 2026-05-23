# stock-analysis-landing

액티브 개인 투자자를 위한 **주식 투자 수익 분석** 랜딩 페이지. Next.js 16 App Router + React 19 + Tailwind CSS v4 + Recharts 기반.

## 주요 섹션

| 섹션 | 설명 |
|---|---|
| **Hero** | 핵심 가치 제안과 12개월 포트폴리오 vs KOSPI 미니 차트 |
| **Pain Points** | 액티브 투자자가 겪는 분석 페인 포인트 |
| **How it works** | CSV 업로드 → 자동 정규화 → 인터랙티브 리포트 3단계 |
| **Trade history** ⭐ | **처분 거래를 직접 입력해 실현 손익·수익률을 자동 계산하는 인터랙티브 섹션** |
| Faq, Footer 외 | (TODO) 추가 섹션 |

> 현재 `metrics-preview`, `benchmark-attribution`, `risk-cost`, `faq`, `site-footer`는 컴포넌트 파일이 아직 만들어지지 않아 `src/app/page.tsx`에서 임시로 주석 처리되어 있습니다. 해당 파일이 추가되면 import만 풀면 됩니다.

## Trade history 섹션

처분이 끝난 거래를 입력하면 한국 시장 표준 수수료·세금을 자동 차감해 **실현 손익**과 **수익률**을 계산합니다. 데이터는 브라우저 `localStorage`(`stock-trades-v1`)에만 저장됩니다 — 서버로 전송되지 않습니다.

### 11개 컬럼

`주가코드` · `이름` · `구입가` · `수량` · `구입일` · `처분일` · `처분금액` · `수수료` · `증권거래세` · `거래차액` · `수익률`

### 자동 계산 공식

```
매수원금   = 구입가 × 수량
수수료     ≈ (매수원금 + 처분금액) × 0.00015     // 양방향 0.015%
증권거래세 ≈ 처분금액 × 0.0018                  // 코스피·코스닥 합산 0.18%
거래차액   = 처분금액 − 매수원금 − 수수료 − 증권거래세
수익률(%)  = 거래차액 / 매수원금 × 100
```

수수료·증권거래세는 폼에서 "자동" 토글을 해제하면 직접 입력할 수 있습니다(영수증 기준 정확값 입력용). `거래차액`·`수익률`은 항상 위 공식으로 파생됩니다.

### CRUD

- **추가**: 헤더의 "거래 추가" 버튼
- **수정**: 행 우측 ✏️ 버튼
- **삭제**: 행 우측 🗑️ 버튼 (확인창)
- **초기화**: "초기화" 버튼 — 기본 시드 3건(삼성전자·카카오·SK하이닉스)으로 복원

## 기술 스택

- **Next.js** 16.2.6 (App Router, Turbopack)
- **React** 19.2.4
- **TypeScript** 5
- **Tailwind CSS** v4 (PostCSS 통합, `@theme inline` 토큰)
- **Recharts** 3.8 — 차트 시각화
- **Radix UI** — accordion, progress, tabs, tooltip
- **lucide-react** — 아이콘
- **Pretendard** — 한글 가변 폰트 (CDN)

## 시작하기

```bash
npm install
npm run dev
```

http://localhost:3000 에서 확인.

### 그 외 명령

```bash
npm run build   # 프로덕션 빌드 (TypeScript 타입체크 포함)
npm run start   # 빌드 결과 실행
npm run lint    # ESLint
```

## 폴더 구조

```
src/
├─ app/
│  ├─ layout.tsx          # RootLayout, Pretendard <link>, 다크 모드
│  ├─ page.tsx            # 섹션 조합 (Hero → PainPoints → HowItWorks → TradeHistory)
│  └─ globals.css         # Tailwind v4 + 커스텀 색상 토큰 (--up, --down, --highlight)
├─ components/
│  ├─ nav/site-header.tsx
│  ├─ sections/
│  │  ├─ hero.tsx
│  │  ├─ pain-points.tsx
│  │  ├─ how-it-works.tsx
│  │  ├─ trade-history.tsx       # 메인 섹션 (KPI + 테이블 + CRUD)
│  │  └─ trade-history-form.tsx  # 추가/수정 인라인 폼
│  ├─ charts/                    # Recharts 기반 차트 5종
│  └─ ui/                        # shadcn 스타일 프리미티브 (table, card, tabs 등)
└─ lib/
   ├─ trades.ts                  # Trade 타입, 계산 헬퍼, 시드 데이터
   ├─ use-trades.ts              # useSyncExternalStore 기반 localStorage 훅
   ├─ mock-data.ts               # 차트용 목 데이터
   └─ utils.ts                   # cn() 유틸
```

## 디자인 토큰

`globals.css`에 한국식 **빨강=상승 / 파랑=하락** 색상 체계가 CSS 변수로 정의되어 있습니다.

```css
--up:        #ef4444   /* 수익(+) */
--down:      #3b82f6   /* 손실(−) */
--highlight: #a78bfa   /* 강조 */
```

Tailwind에서 `text-up`, `text-down`, `bg-highlight/15` 같이 사용합니다.

## 배포

[Vercel](https://vercel.com)에 GitHub 연동으로 자동 배포됩니다. `main` 브랜치 푸시 시 자동 빌드.

빌드 시 주의 — Next.js는 `next build`에서 전체 TypeScript 타입체크를 실행합니다. ESLint(`npm run lint`)만 통과해도 `next build`가 실패할 수 있으니, 푸시 전 로컬에서 `npm run build`를 한 번 돌려보길 권장합니다.

## 라이선스

Private (학습·실습 용도).
