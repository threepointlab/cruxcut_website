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

-- 팀 allowlist — 실제 접근 제어의 진실 원천(DB에서 강제).
-- 여기에 없는 이메일은 로그인해도(가입이 켜져 있어도) read/write 불가.
create table if not exists backlog_allowed_emails (
  email text primary key
);
alter table backlog_allowed_emails enable row level security;
-- 멤버는 자기 행만 조회 가능. INSERT/UPDATE/DELETE 정책 없음 → 자기 자신 추가 불가(권한 상승 방지).
-- allowlist 수정은 SQL Editor(=프로젝트 소유자/service_role)에서만.
drop policy if exists "member reads own allow" on backlog_allowed_emails;
create policy "member reads own allow" on backlog_allowed_emails for select to authenticated
  using (lower(email) = lower(auth.email()));

-- 멤버십 체크(allowlist RLS 우회 위해 security definer)
create or replace function backlog_is_member() returns boolean
  language sql security definer stable set search_path = public, pg_temp as $$
  select exists (
    select 1 from backlog_allowed_emails a where lower(a.email) = lower(auth.email())
  );
$$;

-- RLS: allowlist에 있는 팀원만 read/write. anon·미등록 로그인 사용자는 차단.
alter table backlog_meta  enable row level security;
alter table backlog_ideas enable row level security;
drop policy if exists "team all meta"  on backlog_meta;
drop policy if exists "team all ideas" on backlog_ideas;
create policy "team all meta"  on backlog_meta  for all to authenticated
  using (backlog_is_member()) with check (backlog_is_member());
create policy "team all ideas" on backlog_ideas for all to authenticated
  using (backlog_is_member()) with check (backlog_is_member());

-- 👉 팀원 이메일을 여기 넣으세요 (이게 실제 접근 제어):
-- insert into backlog_allowed_emails (email) values
--   ('you@team.com'), ('teammate@team.com')
-- on conflict do nothing;

-- 추가 하드닝(권장, 필수 아님): Auth → Settings에서 "Allow new users to sign up" 끄고
--   팀원을 Invite. allowlist가 1차 방어, 가입 차단이 2차 방어.
