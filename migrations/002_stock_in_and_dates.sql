-- ============================================================
-- 마이그레이션: 입고이력 테이블 + 재고이동/입고 날짜 지원
-- SQL Editor에서 실행
-- ============================================================

-- 입고 이력 테이블
create table stock_in_logs (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id),
  quantity integer not null check (quantity > 0),
  stock_date date not null default current_date,
  handled_by uuid not null references profiles(id),
  memo text,
  created_at timestamptz not null default now()
);

alter table stock_in_logs enable row level security;
create policy "stock_in_logs_admin_only" on stock_in_logs for all using (is_admin());

-- 재고이동 이력에 이동일자(수동 지정 가능) 컬럼 추가
alter table inventory_transfers add column if not exists transfer_date date not null default current_date;

-- transfer_inventory 함수를 날짜 파라미터 받도록 재생성
drop function if exists transfer_inventory(uuid, uuid, uuid, integer);

create or replace function transfer_inventory(
  p_product_id uuid,
  p_from_seller_id uuid,
  p_to_seller_id uuid,
  p_quantity integer,
  p_transfer_date date default current_date
) returns uuid
language plpgsql
security definer
as $$
declare
  v_transfer_id uuid;
begin
  if not is_admin() then
    raise exception '관리자만 재고를 이동할 수 있습니다';
  end if;

  if p_from_seller_id is null then
    update admin_inventory set quantity = quantity - p_quantity
    where product_id = p_product_id and quantity >= p_quantity;
    if not found then raise exception '관리자 창고 재고 부족'; end if;
  else
    update seller_inventory set quantity = quantity - p_quantity
    where seller_id = p_from_seller_id and product_id = p_product_id and quantity >= p_quantity;
    if not found then raise exception '판매자 재고 부족'; end if;
  end if;

  if p_to_seller_id is null then
    insert into admin_inventory (product_id, quantity)
    values (p_product_id, p_quantity)
    on conflict (product_id) do update set quantity = admin_inventory.quantity + p_quantity;
  else
    insert into seller_inventory (seller_id, product_id, quantity)
    values (p_to_seller_id, p_product_id, p_quantity)
    on conflict (seller_id, product_id) do update set quantity = seller_inventory.quantity + p_quantity;
  end if;

  insert into inventory_transfers (product_id, from_seller_id, to_seller_id, quantity, handled_by, transfer_date)
  values (p_product_id, p_from_seller_id, p_to_seller_id, p_quantity, auth.uid(), p_transfer_date)
  returning id into v_transfer_id;

  return v_transfer_id;
end;
$$;

-- 입고 처리도 트랜잭션 함수로 (재고증가 + 이력저장 원자적 처리)
create or replace function register_stock_in(
  p_product_id uuid,
  p_quantity integer,
  p_stock_date date default current_date,
  p_memo text default null
) returns uuid
language plpgsql
security definer
as $$
declare
  v_log_id uuid;
begin
  if not is_admin() then
    raise exception '관리자만 입고 처리할 수 있습니다';
  end if;

  update admin_inventory set quantity = quantity + p_quantity
  where product_id = p_product_id;

  if not found then
    insert into admin_inventory (product_id, quantity) values (p_product_id, p_quantity);
  end if;

  insert into stock_in_logs (product_id, quantity, stock_date, handled_by, memo)
  values (p_product_id, p_quantity, p_stock_date, auth.uid(), p_memo)
  returning id into v_log_id;

  return v_log_id;
end;
$$;
