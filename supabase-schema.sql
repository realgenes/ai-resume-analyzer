-- Create profiles table
-- Note: RLS is automatically enabled on auth.users by Supabase
create table public.profiles (
  id uuid references auth.users on delete cascade,
  username text unique,
  email text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (id)
);

-- Create resumes table
create table public.resumes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  resume_path text not null,
  image_path text,
  company_name text not null,
  job_title text not null,
  job_description text not null,
  feedback jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up RLS policies for profiles
alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);

-- Set up RLS policies for resumes
alter table public.resumes enable row level security;

create policy "Users can view own resumes." on resumes
  for select using (auth.uid() = user_id);

create policy "Users can insert own resumes." on resumes
  for insert with check (auth.uid() = user_id);

create policy "Users can update own resumes." on resumes
  for update using (auth.uid() = user_id);

create policy "Users can delete own resumes." on resumes
  for delete using (auth.uid() = user_id);

-- Create storage buckets (only if they don't exist)
insert into storage.buckets (id, name, public) 
values ('resumes', 'resumes', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public) 
values ('images', 'images', false)
on conflict (id) do nothing;

-- Set up storage policies
create policy "Users can upload their own files" on storage.objects
  for insert with check (bucket_id in ('resumes', 'images') and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can view their own files" on storage.objects
  for select using (bucket_id in ('resumes', 'images') and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can update their own files" on storage.objects
  for update using (bucket_id in ('resumes', 'images') and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can delete their own files" on storage.objects
  for delete using (bucket_id in ('resumes', 'images') and auth.uid()::text = (storage.foldername(name))[1]);

-- Function to automatically create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, email)
  values (new.id, new.raw_user_meta_data->>'username', new.email);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create profile on signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql security definer;

-- Triggers for updated_at
create trigger handle_profiles_updated_at before update on public.profiles
  for each row execute procedure public.handle_updated_at();

create trigger handle_resumes_updated_at before update on public.resumes
  for each row execute procedure public.handle_updated_at();
