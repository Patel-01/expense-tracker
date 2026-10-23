create table if not exists todos (
  id bigint generated always as identity primary key,
  task text not null,
  done boolean not null default false,
  created_at timestamptz not null default now()
);
