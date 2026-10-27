/* ============================================================
   صفحه اصلی آریا استور — نسخه ۲ (سکشن‌ها و فیچرهای جدید)
   ============================================================ */
(function () {
  "use strict";

  const S = window.Store;
  const products = () => S.getProducts();

  const USER_SVG =
    '<svg class="icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';

  /* ---------- کارت محصول کوچک ---------- */
  function productCard(p) {
    const off = S.offPercent(p);
    const media = p.image
      ? `<img class="mini-img" src="${p.image}" alt="${S.esc(p.name)}" loading="lazy" decoding="async">`
      : `<span class="mini-emoji" aria-hidden="true">${p.icon}</span>`;
    return `
      <div class="mini-product tilt-card">
        <a class="mini-link" href="products/products.html?product=${encodeURIComponent(p.id)}">
          ${off ? `<span class="off-pill">${S.faNum(off)}٪</span>` : ""}
          <div class="mini-thumb">${media}</div>
          <span class="mini-name">${S.esc(p.name)}</span>
          <div class="price-block">
            ${off ? `<span class="old-price">${S.faNum(p.oldPrice)}</span>` : ""}
            <span class="new-price">${S.faNum(p.priceValue)} <small>تومان</small></span>
          </div>
        </a>
        <button type="button" class="mini-add-btn" data-id="${encodeURIComponent(p.id)}">افزودن به سبد</button>
      </div>`;
  }

  /* ---------- فیچر: کاوش دسته‌بندی با فیلتر زنده ---------- */
  function renderExplore() {
    const tabsWrap = document.getElementById("exploreTabs");
    const grid = document.getElementById("exploreGrid");
    if (!tabsWrap || !grid) return;

    const list = products();
    const cats = ["همه"].concat(
      list.map((p) => p.category).filter((c, i, a) => c && a.indexOf(c) === i)
    );

    tabsWrap.innerHTML = cats
      .map(
        (c, i) =>
          `<button type="button" class="hp-tab${i === 0 ? " active" : ""}" data-cat="${S.esc(c)}">` +
          `<span class="hp-tab-ico" aria-hidden="true">${S.catIcon(c)}</span>` +
          `<span class="hp-tab-label">${S.esc(c)}</span></button>`
      )
      .join("");

    const draw = (cat) => {
      const items = cat === "همه" ? list : list.filter((p) => p.category === cat);
      grid.innerHTML = items.map(productCard).join("");
      // دوباره فعال‌سازی افکتtilt برای کارت‌های تازه
      bindTilt(grid);
    };
    draw("همه");

    tabsWrap.addEventListener("click", (e) => {
      const tab = e.target.closest(".hp-tab");
      if (!tab) return;
      tabsWrap.querySelectorAll(".hp-tab").forEach((t) => t.classList.toggle("active", t === tab));
      draw(tab.dataset.cat);
    });
  }

  /* ---------- فیچر: لیست رتبه‌بندی‌شده پرفروش‌ها ---------- */
  function renderTop() {
    const wrap = document.getElementById("topList");
    if (!wrap) return;
    const ranked = products()
      .slice()
      .sort((a, b) => S.offPercent(b) - S.offPercent(a) || (b.amazing ? 1 : 0) - (a.amazing ? 1 : 0))
      .slice(0, 5);

    wrap.innerHTML = ranked
      .map((p, i) => {
        const media = p.image
          ? `<img src="${p.image}" alt="${S.esc(p.name)}" loading="lazy" decoding="async">`
          : `<span class="hp-top-emoji" aria-hidden="true">${p.icon}</span>`;
        return `
        <div class="hp-top-row tilt-card">
          <span class="hp-rank">${S.toFa(i + 1)}</span>
          <div class="hp-top-thumb">${media}</div>
          <div class="hp-top-info">
            <a href="products/products.html?product=${encodeURIComponent(p.id)}" class="hp-top-name">${S.esc(p.name)}</a>
            <span class="hp-top-cat">${S.esc(p.category)}</span>
          </div>
          <div class="hp-top-price">${S.faNum(p.priceValue)} <small>تومان</small></div>
          <button type="button" class="mini-add-btn" data-id="${encodeURIComponent(p.id)}">افزودن</button>
        </div>`;
      })
      .join("");
    bindTilt(wrap);
  }

  /* ---------- قفسه جدیدترین‌ها ---------- */
  function renderNewArrivals() {
    const grid = document.getElementById("newGrid");
    if (!grid) return;
    const list = products();
    const onSaleIds = list.filter((p) => S.offPercent(p) > 0).map((p) => String(p.id));
    const newest = list.filter((p) => !onSaleIds.includes(String(p.id)));
    grid.innerHTML = (newest.length ? newest : list).slice(0, 8).map(productCard).join("");
    bindTilt(grid);
  }

  /* ---------- پیشنهادهای فوری ---------- */
  function renderAmazing() {
    const track = document.getElementById("amazingTrack");
    if (!track) return;
    const items = products().filter((p) => p.amazing && S.offPercent(p) > 0);
    if (items.length === 0) {
      const box = track.closest(".amazing-box");
      if (box) box.classList.add("is-empty");
      return;
    }
    track.innerHTML = items
      .map((p) => {
        const media = p.image
          ? `<img class="amazing-img" src="${p.image}" alt="${S.esc(p.name)}" loading="lazy" decoding="async">`
          : `<span class="amazing-emoji" aria-hidden="true">${p.icon}</span>`;
        return `
        <div class="amazing-card tilt-card">
          <a class="amazing-link" href="products/products.html?product=${encodeURIComponent(p.id)}">
            <span class="amazing-off-pill">${S.faNum(S.offPercent(p))}٪</span>
            <div class="amazing-thumb">${media}</div>
            <h4 class="amazing-title">${S.esc(p.name)}</h4>
            <div class="price-block">
              <span class="old-price">${S.faNum(p.oldPrice)}</span>
              <span class="new-price">${S.faNum(p.priceValue)} <small>تومان</small></span>
            </div>
          </a>
          <button type="button" class="mini-add-btn" data-id="${encodeURIComponent(p.id)}">افزودن به سبد</button>
        </div>`;
      })
      .join("");
    bindTilt(track);
  }

  /* ---------- bindTilt: فعال‌سازی افکت سه‌بعدی برای کارت‌های تازه ---------- */
  function bindTilt(scope) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    scope.querySelectorAll(".tilt-card:not([data-tilt])").forEach((card) => {
      card.setAttribute("data-tilt", "1");
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform =
          "perspective(800px) rotateX(" + -y * 6 + "deg) rotateY(" + x * 6 + "deg) translateZ(0)";
      });
      card.addEventListener("mouseleave", () => { card.style.transform = ""; });
    });
  }

  /* ---------- افزودن به سبد ---------- */
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".mini-add-btn");
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();
    const id = btn.dataset.id;
    if (S.addToCart(id, 1)) {
      btn.classList.add("added");
      const label = btn.textContent;
      btn.textContent = "✓ اضافه شد";
      setTimeout(() => {
        btn.classList.remove("added");
        btn.textContent = label;
      }, 1200);
    } else {
      S.toast("محصول پیدا نشد.", "error");
    }
  });

  /* ---------- شمارش معکوس فروش فوری ---------- */
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
      const h = Math.floor(left / 3600000);
      const m = Math.floor((left % 3600000) / 60000);
      const s = Math.floor((left % 60000) / 1000);
      el.textContent = `${pad(h)} : ${pad(m)} : ${pad(s)}`;
      if (left === 0) {
        localStorage.removeItem(KEY);
        deadline = Date.now() + 8 * 3600 * 1000;
        localStorage.setItem(KEY, String(deadline));
      }
    };
    tick();
    setInterval(tick, 1000);
  }

  /* ---------- فیچر: عضویت خبرنامه ---------- */
  function setupNewsletter() {
    const form = document.getElementById("newsForm");
    if (!form) return;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = document.getElementById("newsEmail");
      const val = (input.value || "").trim();
      const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
      if (!ok) {
        S.toast("یک ایمیل معتبر وارد کنید.", "error");
        input.focus();
        return;
      }
      let subs = [];
      try { subs = JSON.parse(localStorage.getItem("newsletter") || "[]"); } catch (_) {}
      if (!subs.includes(val)) subs.push(val);
      try { localStorage.setItem("newsletter", JSON.stringify(subs)); } catch (_) {}
      input.value = "";
      S.toast("🎉 عضویت انجام شد! کد تخفیف به زودی برایتان ارسال می‌شود.", "success");
    });
  }

  /* ---------- جستجو ---------- */
  const homeSearch = document.getElementById("homeSearch");
  if (homeSearch) {
    homeSearch.addEventListener("keydown", (e) => {
      if (e.key !== "Enter") return;
      const q = homeSearch.value.trim();
      window.location.href =
        "products/products.html" + (q ? "?q=" + encodeURIComponent(q) : "");
    });
  }

  /* ---------- منوی موبایل ---------- */
  const menuToggle = document.getElementById("menuToggle");
  const navbarMenu = document.getElementById("navbarMenu");
  function closeMenu() {
    if (navbarMenu) navbarMenu.classList.remove("open");
    if (menuToggle) {
      menuToggle.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
    }
  }
  if (menuToggle && navbarMenu) {
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.addEventListener("click", () => {
      const open = navbarMenu.classList.toggle("open");
      menuToggle.classList.toggle("open", open);
      menuToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  /* ---------- اسکرول نرم لینک‌های داخلی ---------- */
  const navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav-link"));
  navLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");
      if (!href || href === "#" || href.charAt(0) !== "#") return;
      const target = document.querySelector(href);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      closeMenu();
    });
  });

  /* ---------- ورود / خروج ---------- */
  const authArea = document.getElementById("authArea");
  function updateAuthUI() {
    if (!authArea) return;
    const user = S.currentUser();
    const dashboardItem = document.getElementById("dashboardNavItem");
    const dashboardLink = document.getElementById("dashboardNavLink");
    if (user) {
      if (dashboardItem && dashboardLink) {
        dashboardLink.href = S.dashboardPath(user.role);
        dashboardItem.hidden = false;
      }
      authArea.innerHTML = `
        <a href="${S.dashboardPath(user.role)}" class="login-btn user-chip">
          <span class="login-icon">${USER_SVG}</span>
          <span>${S.esc(user.name || "کاربر")}</span>
        </a>
        <button type="button" id="logoutBtn" class="login-btn logout-btn">خروج</button>`;
      const logoutBtn = document.getElementById("logoutBtn");
      if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
          localStorage.removeItem("currentUser");
          window.location.reload();
        });
      }
    } else {
      if (dashboardItem) dashboardItem.hidden = true;
      authArea.innerHTML = `
        <a href="login/login.html" class="login-btn">
          <span class="login-icon">${USER_SVG}</span>
          <span>ورود</span>
        </a>`;
    }
  }

  /* ---------- راه‌اندازی ---------- */
  document.body.classList.add("dark");
  updateAuthUI();
  renderExplore();
  renderAmazing();
  renderTop();
  renderNewArrivals();
  startOfferCountdown();
  setupNewsletter();
  S.updateCartCount();
})();
