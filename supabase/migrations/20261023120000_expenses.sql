create table if not exists expenses (
  id bigint generated always as identity primary key,
  title text not null check (char_length(btrim(title)) between 1 and 100),
  amount numeric(12, 2) not null check (amount > 0),
  category text not null check (category in ('food', 'travel', 'bills', 'other')),
  date date not null default current_date,
  created_at timestamptz not null default now()
);

-- Newest-first listing and date-range filters
create index if not exists expenses_date_id_idx on expenses (date desc, id desc);

-- Only the backend (service_role, which bypasses RLS) may touch this table
alter table expenses enable row level security;

-- Count and sum across every matching row, independent of pagination
create or replace function expense_totals(p_category text default null, p_from date default null, p_to date default null)
returns table (total_count bigint, total_amount numeric)
language sql stable
set search_path = public
as $$
  select count(*), coalesce(sum(amount), 0)
  from expenses
  where (p_category is null or category = p_category)
    and (p_from is null or date >= p_from)
    and (p_to is null or date <= p_to)
$$;

-- Total per category for dates in [p_from, p_to)
create or replace function expense_summary(p_from date, p_to date)
returns table (category text, total numeric)
language sql stable
set search_path = public
as $$
  select category, sum(amount)
  from expenses
  where date >= p_from and date < p_to
  group by category
$$;

revoke execute on function expense_totals(text, date, date) from public, anon, authenticated;
revoke execute on function expense_summary(date, date) from public, anon, authenticated;
grant execute on function expense_totals(text, date, date) to service_role;
grant execute on function expense_summary(date, date) to service_role;
