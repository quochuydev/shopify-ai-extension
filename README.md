```sql
create table if not exists public.ai_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  image_data text,
  generated_content jsonb,
  created_at timestamptz default now()
);
```
