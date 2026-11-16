begin;

create schema if not exists extensions;
create extension if not exists pgcrypto with schema extensions;

create table if not exists public.products (
  id text primary key,
  active boolean not null default false,
  data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.products enable row level security;
grant select on public.products to anon, authenticated;

drop policy if exists "Anyone can read active products" on public.products;
create policy "Anyone can read active products"
  on public.products for select
  to anon, authenticated
  using (active = true);

create table if not exists public.subscribers (
  email text primary key check (char_length(email) <= 200),
  created_at timestamptz not null default now()
);

alter table public.subscribers enable row level security;
grant insert on public.subscribers to anon, authenticated;

drop policy if exists "Anyone can subscribe" on public.subscribers;
create policy "Anyone can subscribe"
  on public.subscribers for insert
  to anon, authenticated
  with check (email = lower(trim(email)));

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
grant select, update on public.profiles to authenticated;

drop policy if exists "Users can read their own profile" on public.profiles;
create policy "Users can read their own profile"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- Include accounts created before the profile trigger was installed.
insert into public.profiles (id, full_name)
select id, raw_user_meta_data ->> 'full_name' from auth.users
on conflict (id) do nothing;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_updated_at on public.products;
create trigger products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Customer details are private to the signed-in customer.
alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists address text;
alter table public.profiles add column if not exists city text;
grant insert on public.profiles to authenticated;
drop policy if exists "Users can create their own profile" on public.profiles;
create policy "Users can create their own profile" on public.profiles
  for insert to authenticated with check ((select auth.uid()) = id);

create table if not exists public.store_settings (
  id integer primary key default 1 check (id = 1),
  phone text, email text, address text, whatsapp text, instagram text, facebook text,
  shipping_fee numeric(12,2) not null default 0 check (shipping_fee >= 0),
  updated_at timestamptz not null default now()
);
alter table public.store_settings enable row level security;
grant select on public.store_settings to anon, authenticated;
revoke insert, update, delete on public.store_settings from anon, authenticated;
drop policy if exists "Anyone can read store settings" on public.store_settings;
create policy "Anyone can read store settings" on public.store_settings
  for select to anon, authenticated using (true);
insert into public.store_settings (id) values (1) on conflict (id) do nothing;
drop trigger if exists store_settings_updated_at on public.store_settings;
create trigger store_settings_updated_at before update on public.store_settings
  for each row execute function public.set_updated_at();

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 100),
  email text not null check (char_length(email) between 3 and 200),
  phone text not null default '' check (char_length(phone) <= 30),
  subject text not null check (char_length(subject) between 3 and 150),
  message text not null check (char_length(message) between 10 and 4000),
  status text not null default 'new' check (status in ('new', 'read', 'replied')),
  created_at timestamptz not null default now()
);
alter table public.contact_messages enable row level security;
revoke all on public.contact_messages from anon, authenticated;
create index if not exists contact_messages_email_created_idx on public.contact_messages (email, created_at desc);
create or replace function public.submit_contact_message(details jsonb)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  message_id uuid;
  address text := lower(trim(details ->> 'email'));
begin
  if address is null or address !~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$' or char_length(address) > 200 then
    raise exception 'Invalid email.' using errcode = '22023';
  end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('contact:' || address, 0));
  if (select count(*) from public.contact_messages where email = address and created_at > now() - interval '1 hour') >= 5 then
    raise exception 'Too many messages.';
  end if;
  insert into public.contact_messages (name, email, phone, subject, message)
    values (trim(details ->> 'name'), address, trim(coalesce(details ->> 'phone', '')),
      trim(details ->> 'subject'), trim(details ->> 'message')) returning id into message_id;
  return message_id;
end;
$$;
revoke all on function public.submit_contact_message(jsonb) from public;
grant execute on function public.submit_contact_message(jsonb) to anon, authenticated;

revoke insert on public.subscribers from anon, authenticated;
create or replace function public.subscribe_newsletter(address text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  address := lower(trim(address));
  if address is null or address !~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$' or char_length(address) > 200 then
    raise exception 'Invalid email.' using errcode = '22023';
  end if;
  insert into public.subscribers(email) values (address) on conflict (email) do nothing;
end;
$$;
revoke all on function public.subscribe_newsletter(text) from public;
grant execute on function public.subscribe_newsletter(text) to anon, authenticated;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  request_key uuid not null,
  email text not null,
  full_name text not null check (char_length(full_name) between 2 and 100),
  phone text not null check (phone ~ '^[+]?[0-9 ()-]{7,30}$'),
  address text not null check (char_length(address) between 10 and 500),
  city text not null check (char_length(city) between 2 and 100),
  notes text not null default '' check (char_length(notes) <= 1000),
  payment_method text not null default 'cod' check (payment_method = 'cod'),
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  items jsonb not null check (jsonb_typeof(items) = 'array' and jsonb_array_length(items) between 1 and 50),
  subtotal numeric(12,2) not null check (subtotal > 0),
  shipping_fee numeric(12,2) not null check (shipping_fee >= 0),
  total numeric(12,2) not null check (total = subtotal + shipping_fee),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, request_key)
);
alter table public.orders enable row level security;
revoke all on public.orders from anon, authenticated;
grant select on public.orders to authenticated;
drop policy if exists "Users can read their own orders" on public.orders;
create policy "Users can read their own orders" on public.orders
  for select to authenticated using ((select auth.uid()) = user_id);
create index if not exists orders_user_created_idx on public.orders(user_id, created_at desc);
drop trigger if exists orders_updated_at on public.orders;
create trigger orders_updated_at before update on public.orders
  for each row execute function public.set_updated_at();

-- Prices and stock are read and updated under row locks in a single transaction.
create or replace function public.place_order(customer jsonb, cart_items jsonb, request_key uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  buyer uuid := auth.uid();
  buyer_email text;
  previous_order public.orders%rowtype;
  product_row public.products%rowtype;
  entry jsonb;
  variant jsonb;
  variant_index integer;
  qty integer;
  inventory integer;
  unit_price numeric(12,2);
  subtotal_amount numeric(12,2) := 0;
  delivery_amount numeric(12,2);
  snapshots jsonb := '[]'::jsonb;
  order_id uuid;
begin
  if buyer is null then raise exception 'Sign in to place an order.' using errcode = '42501'; end if;
  if request_key is null then raise exception 'Invalid request key.' using errcode = '22023'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(buyer::text || request_key::text, 0));
  select * into previous_order from public.orders o where o.user_id = buyer and o.request_key = place_order.request_key;
  if found then return jsonb_build_object('id', previous_order.id, 'total', previous_order.total); end if;
  select email into buyer_email from auth.users where id = buyer and email_confirmed_at is not null;
  if not found then raise exception 'Please verify your email before ordering.'; end if;
  if jsonb_typeof(customer) is distinct from 'object'
    or char_length(trim(coalesce(customer ->> 'full_name', ''))) not between 2 and 100
    or coalesce(customer ->> 'phone', '') !~ '^[+]?[0-9 ()-]{7,30}$'
    or char_length(trim(coalesce(customer ->> 'address', ''))) not between 10 and 500
    or char_length(trim(coalesce(customer ->> 'city', ''))) not between 2 and 100
    or char_length(coalesce(customer ->> 'notes', '')) > 1000 then
    raise exception 'Invalid delivery details.' using errcode = '22023';
  end if;
  if jsonb_typeof(cart_items) is distinct from 'array' then raise exception 'Invalid cart.' using errcode = '22023'; end if;
  if jsonb_array_length(cart_items) not between 1 and 50 then raise exception 'Invalid cart.' using errcode = '22023'; end if;
  if (select count(*) from (select distinct value ->> 'productId', value ->> 'variantId'
    from jsonb_array_elements(cart_items)) unique_lines) <> jsonb_array_length(cart_items) then
    raise exception 'Duplicate cart items.' using errcode = '22023';
  end if;
  if (select count(*) from public.orders where user_id = buyer and status = 'pending') >= 20 then
    raise exception 'Please contact the store before placing another order.';
  end if;
  select shipping_fee into delivery_amount from public.store_settings where id = 1;
  if delivery_amount is null then raise exception 'Delivery is not configured.'; end if;
  for entry in select value from jsonb_array_elements(cart_items) order by value ->> 'productId', value ->> 'variantId'
  loop
    if jsonb_typeof(entry -> 'quantity') is distinct from 'number' or (entry ->> 'quantity') !~ '^[0-9]{1,2}$' then
      raise exception 'Invalid quantity.' using errcode = '22023';
    end if;
    qty := (entry ->> 'quantity')::integer;
    if qty not between 1 and 50 then raise exception 'Invalid quantity.' using errcode = '22023'; end if;
    select * into product_row from public.products where id = entry ->> 'productId' and active = true for update;
    if not found then raise exception 'One or more products are no longer available.'; end if;
    select value, (ordinality - 1)::integer into variant, variant_index
      from jsonb_array_elements(product_row.data -> 'variants') with ordinality
      where value ->> 'id' = entry ->> 'variantId';
    if not found then raise exception 'One or more products are no longer available.'; end if;
    unit_price := round((variant ->> 'price')::numeric, 2);
    inventory := (variant ->> 'stock')::integer;
    if unit_price is null or inventory is null or unit_price <= 0 or inventory <= 0
      or coalesce((product_row.data ->> 'isSample')::boolean, false) then
      raise exception 'An item is out of stock or its price is not set.';
    end if;
    if inventory < qty then raise exception 'Not enough stock. Please update your cart.'; end if;
    update public.products set data = jsonb_set(data, array['variants', variant_index::text, 'stock'], to_jsonb(inventory - qty)) where id = product_row.id;
    subtotal_amount := subtotal_amount + unit_price * qty;
    snapshots := snapshots || jsonb_build_array(jsonb_build_object(
      'productId', product_row.id, 'variantId', entry ->> 'variantId', 'name', product_row.data ->> 'name',
      'variantLabel', variant ->> 'label', 'quantity', qty, 'price', unit_price));
  end loop;
  insert into public.orders (user_id, request_key, email, full_name, phone, address, city, notes, items, subtotal, shipping_fee, total)
    values (buyer, request_key, buyer_email, trim(customer ->> 'full_name'), trim(customer ->> 'phone'), trim(customer ->> 'address'),
      trim(customer ->> 'city'), trim(coalesce(customer ->> 'notes', '')), snapshots, subtotal_amount, delivery_amount, subtotal_amount + delivery_amount)
    returning id into order_id;
  return jsonb_build_object('id', order_id, 'total', subtotal_amount + delivery_amount);
end;
$$;
revoke all on function public.place_order(jsonb, jsonb, uuid) from public, anon;
grant execute on function public.place_order(jsonb, jsonb, uuid) to authenticated;

commit;