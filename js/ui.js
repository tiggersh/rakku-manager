// ============================================================
// 공통 UI 헬퍼
// ============================================================

export function won(n) {
  return Number(n || 0).toLocaleString('ko-KR') + '원';
}

// Supabase 임베드 결과가 배열/객체 어느 쪽으로 와도 안전하게 수량 추출
// (product.admin_inventory 가 FK 관계상 1:1이라 객체로 오는 경우가 있음)
export function invQty(row, key = 'admin_inventory') {
  const inv = row?.[key];
  if (Array.isArray(inv)) return inv[0]?.quantity ?? 0;
  return inv?.quantity ?? 0;
}

export function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

// 숫자 입력창에 천단위 콤마 자동 표시 (type="text" 인풋에 적용)
export function bindThousandsInput(el) {
  el.addEventListener('input', () => {
    const raw = el.value.replace(/[^0-9]/g, '');
    el.value = raw ? Number(raw).toLocaleString('ko-KR') : '';
  });
}

// 콤마 포맷된 입력값에서 순수 숫자만 추출
export function rawNumber(el) {
  return el.value.replace(/[^0-9]/g, '') || '0';
}

// 숫자를 콤마 포맷 문자열로 (input value 세팅용, "원" 단위 없음)
export function formatNumber(n) {
  return n ? Number(n).toLocaleString('ko-KR') : '';
}

export function renderAdminNav(active) {
  const items = [
    { id: 'dashboard', label: '홈', href: '/admin/dashboard.html' },
    { id: 'products', label: '상품', href: '/admin/products.html' },
    { id: 'inventory', label: '재고', href: '/admin/inventory.html' },
    { id: 'sellers', label: '판매자', href: '/admin/sellers.html' },
    { id: 'settlements', label: '정산', href: '/admin/settlements.html' },
  ];
  return `<nav class="bottom-nav">${items.map(i =>
    `<a href="${i.href}" class="nav-item ${i.id === active ? 'active' : ''}"><span>${i.label}</span></a>`
  ).join('')}</nav>`;
}

export function renderSellerNav(active) {
  const items = [
    { id: 'dashboard', label: '홈', href: '/seller/dashboard.html' },
    { id: 'inventory', label: '내 재고', href: '/seller/inventory.html' },
    { id: 'register', label: '판매등록', href: '/seller/register-sale.html' },
    { id: 'sales', label: '판매내역', href: '/seller/sales.html' },
  ];
  return `<nav class="bottom-nav">${items.map(i =>
    `<a href="${i.href}" class="nav-item ${i.id === active ? 'active' : ''}"><span>${i.label}</span></a>`
  ).join('')}</nav>`;
}

export function renderHeader(title, subtitle) {
  return `
    <div style="margin-bottom: 20px;">
      <h1 style="font-size: 22px;">${title}</h1>
      ${subtitle ? `<p class="text-secondary" style="margin-top: 4px; font-size: 13px;">${subtitle}</p>` : ''}
    </div>
  `;
}

let toastTimer;
export function showToast(msg, type = 'default') {
  let el = document.getElementById('toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'toast';
    el.style.cssText = `
      position: fixed; bottom: 84px; left: 50%; transform: translateX(-50%);
      background: var(--surface-raised); border: 1px solid var(--border-strong);
      color: var(--text); padding: 12px 18px; border-radius: 100px;
      font-size: 13px; font-weight: 500; z-index: 999; max-width: 90%;
      text-align: center; opacity: 0; transition: opacity 0.2s ease;
    `;
    document.body.appendChild(el);
  }
  const colors = { success: 'var(--success)', danger: 'var(--danger)', default: 'var(--text)' };
  el.style.color = colors[type] || colors.default;
  el.textContent = msg;
  el.style.opacity = '1';
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.style.opacity = '0'; }, 2200);
}
