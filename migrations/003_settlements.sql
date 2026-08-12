-- ============================================================
-- 마이그레이션 003: 정산 처리 RPC
-- SQL Editor에서 실행
-- ============================================================

-- 판매자의 미정산 판매건을 모아 정산 1건 생성
create or replace function create_settlement(p_seller_id uuid)
returns uuid
language plpgsql
security definer
as $$
declare
  v_settlement_id uuid;
  v_total numeric;
begin
  if not is_admin() then
    raise exception '관리자만 정산을 생성할 수 있습니다';
  end if;

  select coalesce(sum(admin_settlement_amount), 0) into v_total
  from sales
  where seller_id = p_seller_id and status = 'active' and settlement_id is null;

  if v_total <= 0 then
    raise exception '정산할 미정산 판매건이 없습니다';
  end if;

  insert into settlements (seller_id, total_due, status)
  values (p_seller_id, v_total, 'pending')
  returning id into v_settlement_id;

  insert into settlement_items (settlement_id, sale_id, amount)
  select v_settlement_id, id, admin_settlement_amount
  from sales
  where seller_id = p_seller_id and status = 'active' and settlement_id is null;

  update sales set settlement_id = v_settlement_id
  where seller_id = p_seller_id and status = 'active' and settlement_id is null;

  return v_settlement_id;
end;
$$;

-- 입금 확인 처리 (분할 입금 지원, 누적으로 계산)
create or replace function confirm_settlement_payment(
  p_settlement_id uuid,
  p_paid_amount numeric,
  p_paid_date date default current_date
) returns void
language plpgsql
security definer
as $$
declare
  v_total numeric;
  v_prev_paid numeric;
  v_new_paid numeric;
begin
  if not is_admin() then
    raise exception '관리자만 입금 확인 처리를 할 수 있습니다';
  end if;

  select total_due, paid_amount into v_total, v_prev_paid
  from settlements where id = p_settlement_id;

  if v_total is null then
    raise exception '정산 정보를 찾을 수 없습니다';
  end if;

  v_new_paid := v_prev_paid + p_paid_amount;

  update settlements
  set paid_amount = v_new_paid,
      status = case when v_new_paid >= v_total then 'completed' else 'partial' end,
      paid_at = p_paid_date
  where id = p_settlement_id;
end;
$$;

-- 이미 정산에 포함된 판매건은 취소 불가하도록 가드 추가
create or replace function cancel_sale(p_sale_id uuid)
returns void
language plpgsql
security definer
as $$
declare
  v_sale sales%rowtype;
begin
  if not is_admin() then
    raise exception '관리자만 판매를 취소할 수 있습니다';
  end if;

  select * into v_sale from sales where id = p_sale_id and status = 'active';
  if not found then
    raise exception '이미 취소되었거나 존재하지 않는 판매건입니다';
  end if;

  if v_sale.settlement_id is not null then
    raise exception '이미 정산에 포함된 판매건은 취소할 수 없습니다. 정산을 먼저 취소해주세요.';
  end if;

  update seller_inventory
  set quantity = quantity + v_sale.quantity
  where seller_id = v_sale.seller_id and product_id = v_sale.product_id;

  update sales set status = 'cancelled', updated_at = now()
  where id = p_sale_id;
end;
$$;
