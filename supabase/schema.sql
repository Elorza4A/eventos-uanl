-- Esquema mínimo de roles. Ejecutar en el SQL Editor de Supabase.
-- El rol se guarda en la base de datos y es la fuente de verdad para el DAL.

create type public.rol_usuario as enum ('asistente', 'organizador', 'admin');

create table if not exists public.perfiles (
  id uuid primary key references auth.users(id) on delete cascade,
  rol public.rol_usuario not null default 'asistente',
  nombre text
);

-- Todo registro nuevo entra como asistente.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.perfiles (id, rol, nombre)
  values (new.id, 'asistente', new.raw_user_meta_data ->> 'nombre')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.perfiles enable row level security;

drop policy if exists "Perfil propio" on public.perfiles;
create policy "Perfil propio" on public.perfiles
  for select to authenticated
  using (auth.uid() = id);

-- Para crear cuentas de equipo: registrar al usuario desde Supabase y luego:
-- update public.perfiles set rol = 'organizador' where id = '<uuid>';
-- update public.perfiles set rol = 'admin'       where id = '<uuid>';
