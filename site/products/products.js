/* ============================================================
   صفحه محصولات آریا استور
   ============================================================ */
(function () {
  "use strict";

  const S = window.Store;

  const HEART =
    '<svg class="icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>';
  const HEART_ON =
    '<svg class="icon" viewBox="0 0 24 24" width="20" height="20" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>';

  const searchInput = document.getElementById("searchInput");
  const grid = document.getElementById("productsGrid");
  const filterWrap = document.getElementById("filterChips");

  let activeCat = "همه";

  /* ---------- فیلترها ---------- */

  function renderFilters() {
    if (!filterWrap) return;
    const cats = ["همه"].concat(S.getCategories());
    filterWrap.innerHTML = cats
      .map(
        (c) =>
          `<button type="button" class="filter-chip${
            c === activeCat ? " active" : ""
          }" data-cat="${S.esc(c)}"><span class="hp-tab-ico" aria-hidden="true">${S.catIcon(c)}</span>${S.esc(c)}</button>`
      )
      .join("");
    filterWrap.querySelectorAll(".filter-chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        activeCat = chip.dataset.cat;
        filterWrap
          .querySelectorAll(".filter-chip")
          .forEach((c) => c.classList.toggle("active", c === chip));
        renderProducts();
      });
    });
  }

  /* ---------- کارت محصول ---------- */

  function card(p) {
    const off = S.offPercent(p);
    const wished = S.isWished("product", p.id);
    const media = p.image
      ? `<img class="product-img" src="${p.image}" alt="${S.esc(
          p.name
        )}" loading="lazy" decoding="async">`
      : `<span class="product-emoji" aria-hidden="true">${p.icon}</span>`;
    return `
    <article class="product-card reveal-center" data-id="${S.esc(p.id)}">
      <div class="product-thumb">
        ${media}
        ${off ? `<span class="off-pill">${S.faNum(off)}٪</span>` : ""}
        <button type="button" class="wishlist-icon${
          wished ? " active" : ""
        }" data-id="${S.esc(p.id)}" aria-label="افزودن به علاقه‌مندی‌ها" aria-pressed="${
      wished ? "true" : "false"
    }">${wished ? HEART_ON : HEART}</button>
      </div>
      <div class="product-body">
        <span class="product-cat">${S.esc(p.category)}</span>
        <h3 class="product-title">${S.esc(p.name)}</h3>
        <p class="product-desc">${S.esc(p.desc || "")}</p>
        <div class="price-block">
          ${off ? `<span class="old-price">${S.faNum(p.oldPrice)}</span>` : ""}
          <span class="new-price">${S.faNum(p.priceValue)} <small>تومان</small></span>
        </div>
      </div>
      <div class="product-actions">
        <button type="button" class="add-to-cart" data-id="${S.esc(p.id)}">افزودن به سبد</button>
        <button type="button" class="buy-now-btn" data-id="${S.esc(p.id)}">خرید</button>
      </div>
    </article>`;
  }

  /* ---------- نمایش محصولات ---------- */

  function renderProducts() {
    if (!grid) return;
    const q = (searchInput ? searchInput.value : "").trim().toLowerCase();
    const list = S.getProducts().filter((p) => {
      const matchCat = activeCat === "همه" || p.category === activeCat;
      const haystack = (p.name + " " + p.category + " " + (p.desc || "")).toLowerCase();
      return matchCat && (!q || haystack.indexOf(q) > -1);
    });

    grid.innerHTML = list.length
      ? list.map(card).join("")
      : '<p class="no-products">محصولی مطابق جستجوی شما پیدا نشد.</p>';

    grid.querySelectorAll(".add-to-cart").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (S.addToCart(btn.dataset.id)) S.toast("محصول به سبد خرید اضافه شد.");
      });
    });

    grid.querySelectorAll(".buy-now-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (!S.addToCart(btn.dataset.id)) return;
        window.location.href = S.BASE + "cart/cart.html";
      });
    });

    grid.querySelectorAll(".wishlist-icon").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const added = S.toggleWishlist("product", btn.dataset.id);
        btn.classList.toggle("active", added);
        btn.setAttribute("aria-pressed", added ? "true" : "false");
        btn.innerHTML = added ? HEART_ON : HEART;
        S.toast(added ? "به علاقه‌مندی‌ها اضافه شد." : "از علاقه‌مندی‌ها حذف شد.");
      });
    });

    requestAnimationFrame(() => {
      grid
        .querySelectorAll(".reveal-center")
        .forEach((el) => el.classList.add("is-visible"));
    });
  }

  /* ---------- پیشنهاد شگفت‌انگیز ---------- */

  function renderAmazing() {
    const track = document.getElementById("amazingTrack");
    if (!track) return;
    const items = S.getProducts().filter((p) => p.amazing && S.offPercent(p) > 0);
    if (items.length === 0) {
      const section = document.getElementById("amazingOffers");
      if (section) section.hidden = true;
      return;
    }
    track.innerHTML = items
      .map((p) => {
        const media = p.image
          ? `<img class="amazing-img" src="${p.image}" alt="${S.esc(
              p.name
            )}" loading="lazy" decoding="async">`
          : `<span class="amazing-emoji" aria-hidden="true">${p.icon}</span>`;
        return `
        <div class="amazing-card" data-id="${S.esc(p.id)}">
          <span class="amazing-off-pill">${S.faNum(S.offPercent(p))}٪</span>
          <div class="amazing-thumb">${media}</div>
          <h4 class="amazing-title">${S.esc(p.name)}</h4>
          <div class="price-block">
            <span class="old-price">${S.faNum(p.oldPrice)}</span>
            <span class="new-price">${S.faNum(p.priceValue)} <small>تومان</small></span>
          </div>
          <button type="button" class="buy-now-btn" data-id="${S.esc(p.id)}">خرید سریع</button>
        </div>`;
      })
      .join("");

    track.querySelectorAll(".buy-now-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (!S.addToCart(btn.dataset.id)) return;
        window.location.href = S.BASE + "cart/cart.html";
      });
    });
  }

  function startOfferCountdown() {
    const el = document.getElementById("offerTimer");
    if (!el) return;
    const KEY = "offerDeadline";
    let deadline = Number(localStorage.getItem(KEY)) || 0;
    if (!deadline || deadline < Date.now()) {
      deadline = Date.now() + 8 * 3600 * 1000;
      localStorage.setItem(KEY, String(deadline));
    }
    const pad = (n) => S.toFa(String(n).padStart(2, "0"));
    const tick = () => {
      const left = Math.max(0, deadline - Date.now());
      el.textContent = `${pad(Math.floor(left / 3600000))} : ${pad(
        Math.floor((left % 3600000) / 60000)
      )} : ${pad(Math.floor((left % 60000) / 1000))}`;
    };
    tick();
    setInterval(tick, 1000);
  }

  /* ---------- راه‌اندازی ---------- */

  if (searchInput) {
    searchInput.addEventListener("input", renderProducts);
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    const cat = params.get("cat");
    if (q) searchInput.value = q;
    if (cat && S.getCategories().indexOf(cat) > -1) activeCat = cat;
  }

  document.body.classList.add("dark");
  renderFilters();
  renderProducts();
  renderAmazing();
  startOfferCountdown();
  S.updateCartCount();
})();
