/* ============================================================
   سبد خرید آریا استور
   ============================================================ */
(function () {
  "use strict";

  const S = window.Store;

  const cartList = document.getElementById("cartList");
  const cartEmpty = document.getElementById("cartEmpty");
  const cartSummary = document.getElementById("cartSummary");
  const cartTotal = document.getElementById("cartTotal");
  const cartPayable = document.getElementById("cartPayable");
  const discountRow = document.getElementById("discountRow");
  const discountAmount = document.getElementById("discountAmount");
  const discountInput = document.getElementById("discountInput");
  const discountBtn = document.getElementById("discountBtn");
  const discountMsg = document.getElementById("discountMsg");
  const checkoutBtn = document.getElementById("checkoutBtn");

  const DISCOUNTS = {
    OFF10: 0.1,
    WELCOME20: 0.2,
    SAVE50: 0.5,
  };

  let appliedRate = 0;
  let appliedCode = "";

  /* ---------- محاسبه جمع‌ها ---------- */

  function computeTotals() {
    const total = S.cartTotal();
    const discount = Math.round(total * appliedRate);
    if (cartTotal) cartTotal.textContent = S.faPrice(total);
    if (cartPayable) cartPayable.textContent = S.faPrice(total - discount);
    if (discountRow) {
      discountRow.hidden = appliedRate <= 0;
      if (appliedRate > 0 && discountAmount) {
        discountAmount.textContent = "− " + S.faPrice(discount);
      }
    }
  }

  /* ---------- نمایش سبد ---------- */

  function renderCart() {
    if (!cartList) return;
    const cart = S.getCart();

    cartList.innerHTML = cart
      .map((item) => {
        const media = item.image
          ? `<img class="item-img" src="${item.image}" alt="${S.esc(item.name)}" loading="lazy" decoding="async">`
          : `<span class="item-emoji" aria-hidden="true">${item.icon}</span>`;
        return `
        <div class="cart-item" data-id="${S.esc(item.id)}">
          <a class="item-thumb" href="${S.BASE}products/products.html">${media}</a>
          <div class="item-info">
            <div class="item-name">${S.esc(item.name)}</div>
            <div class="item-price">${S.faPrice(item.priceValue)}</div>
          </div>
          <div class="qty-controls">
            <button type="button" class="qty-btn" data-action="inc" data-id="${S.esc(item.id)}" aria-label="افزودن">+</button>
            <span class="qty-value">${S.toFa(item.qty)}</span>
            <button type="button" class="qty-btn" data-action="dec" data-id="${S.esc(item.id)}" aria-label="کاهش">−</button>
          </div>
          <div class="item-line-total">${S.faPrice(item.priceValue * item.qty)}</div>
          <button type="button" class="remove-btn" data-action="remove" data-id="${S.esc(item.id)}">حذف</button>
        </div>`;
      })
      .join("");

    if (cartEmpty) cartEmpty.hidden = cart.length > 0;
    if (cartSummary) cartSummary.hidden = cart.length === 0;
    computeTotals();
  }

  /* ---------- رویدادهای سبد ---------- */

  if (cartList) {
    cartList.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-action]");
      if (!btn) return;
      const id = btn.dataset.id;
      const action = btn.dataset.action;
      const item = S.getCart().find((i) => String(i.id) === String(id));
      if (!item) return;

      if (action === "inc") S.setCartQty(id, item.qty + 1);
      else if (action === "dec") S.setCartQty(id, item.qty - 1);
      else if (action === "remove") S.removeFromCart(id);

      renderCart();
    });
  }

  /* ---------- کد تخفیف ---------- */

  if (discountBtn && discountInput) {
    discountBtn.addEventListener("click", () => {
      const code = discountInput.value.trim().toUpperCase();
      if (!code) {
        setDiscountMessage("لطفاً کد تخفیف را وارد کنید.", "error");
        return;
      }
      if (DISCOUNTS[code] !== undefined) {
        appliedRate = DISCOUNTS[code];
        appliedCode = code;
        setDiscountMessage(`کد تخفیف ${code} با موفقیت اعمال شد.`, "success");
      } else {
        appliedRate = 0;
        appliedCode = "";
        setDiscountMessage("کد تخفیف نامعتبر است.", "error");
      }
      computeTotals();
    });
  }

  function setDiscountMessage(text, type) {
    if (!discountMsg) return;
    discountMsg.textContent = text;
    discountMsg.className = "discount-msg " + type;
  }

  /* ---------- پرداخت ---------- */

  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => {
      const user = S.currentUser();
      if (!user) {
        S.toast("برای ثبت سفارش ابتدا وارد حساب خود شوید.", "error");
        setTimeout(() => {
          window.location.href = S.BASE + "login/login.html?redirect=cart/cart.html";
        }, 900);
        return;
      }
      if (S.getCart().length === 0) return;

      const order = S.createOrder(appliedRate);
      if (!order) return;

      appliedRate = 0;
      appliedCode = "";
      if (discountInput) discountInput.value = "";
      setDiscountMessage("", "");
      renderCart();
      S.toast(
        `سفارش ${order.id} با موفقیت ثبت شد — مبلغ قابل پرداخت ${S.faPrice(
          order.payable
        )}`
      );
    });
  }

  document.body.classList.add("dark");
  renderCart();
  S.updateCartCount();
})();
