-- src/lib/trades.ts의 SEED_TRADES와 동일.
-- 재실행 시 중복이 쌓이므로 한 번만 실행할 것.
-- 주의: 시드 INSERT는 인증 컨텍스트 밖에서 실행되어 user_id가 NULL로 들어간다.
-- 새 RLS 정책 (user_id = auth.uid()) 하에서 이 행들은 어떤 로그인 사용자에게도 보이지 않는다.
-- 로컬 supabase db reset 시 사전 스모크 테스트 용도로만 의미가 있다.

insert into public.trades
  (ticker, name, buy_price, quantity, buy_date, sell_date, sell_amount)
values
  ('005930', '삼성전자',   70000,  100, '2024-03-15', '2024-09-20', 7850000),
  ('035720', '카카오',     55000,   50, '2024-01-10', '2024-06-25', 2410000),
  ('000660', 'SK하이닉스', 130000,  30, '2023-11-05', '2025-01-15', 6600000);
