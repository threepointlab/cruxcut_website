-- tplab/CruxCut 백로그 — Supabase 스키마
-- Supabase 대시보드 → SQL Editor 에 붙여넣고 실행.

-- 단일 메타 행 (personas, categories, goalPriority 등)
create table if not exists backlog_meta (
  id int primary key default 1,
  meta jsonb not null default '{}'::jsonb,
  personas jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  constraint singleton check (id = 1)
);

-- 티켓 1건 = 1행. 정렬·필터용 컬럼 + 전체 객체는 data(jsonb).
create table if not exists backlog_ideas (
  id text primary key,                 -- 'IDEA-001'
  ord int not null default 0,          -- 정렬(IDEA 번호)
  category text,                       -- new | cliff_ios | climbpipekit | gtm
  type text,                           -- feature | engineering | bugfix
  status text not null default 'todo', -- todo | doing | done
  ice int,                             -- iceScore (eng/bug는 null)
  data jsonb not null,                 -- 티켓 전체(children·evidence·implementation 등)
  updated_at timestamptz not null default now()
);
create index if not exists backlog_ideas_category_idx on backlog_ideas(category);
create index if not exists backlog_ideas_ord_idx on backlog_ideas(ord);

-- updated_at 자동 갱신
create or replace function backlog_touch() returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;
drop trigger if exists backlog_ideas_touch on backlog_ideas;
create trigger backlog_ideas_touch before update on backlog_ideas
  for each row execute function backlog_touch();
drop trigger if exists backlog_meta_touch on backlog_meta;
create trigger backlog_meta_touch before update on backlog_meta
  for each row execute function backlog_touch();

-- RLS: 로그인한(authenticated) 팀원만 read/write. anon은 아무것도 못 함.
alter table backlog_meta  enable row level security;
alter table backlog_ideas enable row level security;
drop policy if exists "team all meta"  on backlog_meta;
drop policy if exists "team all ideas" on backlog_ideas;
create policy "team all meta"  on backlog_meta  for all to authenticated using (true) with check (true);
create policy "team all ideas" on backlog_ideas for all to authenticated using (true) with check (true);

-- ⚠️ 팀 전용 유지: Auth → Providers → Email 사용, 그리고
--    Auth → Settings에서 "Allow new users to sign up" 끄고 팀원을 직접 Invite(초대) 하세요.
--    (RLS는 '로그인한 사용자'만 막으므로, 누가 계정을 만들 수 있는지는 Auth 설정으로 통제)
