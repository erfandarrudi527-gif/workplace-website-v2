/* ============================================================
   وبلاگ آریا استور
   ============================================================ */
(function () {
  "use strict";

  const S = window.Store;

  const ARROW_L =
    '<svg class="icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>';
  const HEART =
    '<svg class="icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>';
  const HEART_ON =
    '<svg class="icon" viewBox="0 0 24 24" width="20" height="20" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>';

  const grid = document.getElementById("blogGrid");
  const searchInput = document.getElementById("searchInput");

  /* ---------- کارت مطلب ---------- */

  function card(post) {
    const wished = S.isWished("blog", post.id);
    const cover = post.image
      ? `<a class="blog-cover" href="post.html?id=${encodeURIComponent(post.id)}">
           <img src="${post.image}" alt="${S.esc(post.title)}" loading="lazy" decoding="async">
         </a>`
      : "";
    return `
    <article class="blog-card reveal-center">
      ${cover}
      <div class="blog-card-body">
        <span class="blog-date">${S.esc(post.date)}</span>
        <h3>${S.esc(post.title)}</h3>
        <p>${S.esc(post.excerpt)}</p>
        <div class="blog-actions">
          <a href="post.html?id=${encodeURIComponent(post.id)}" class="blog-link">ادامه مطلب ${ARROW_L}</a>
          <button type="button" class="wishlist-btn${wished ? " active" : ""}"
                  data-id="${S.esc(post.id)}" aria-pressed="${wished ? "true" : "false"}">
            ${wished ? HEART_ON : HEART} علاقه‌مندی
          </button>
        </div>
      </div>
    </article>`;
  }

  /* ---------- نمایش مطالب ---------- */

  function renderPosts() {
    if (!grid) return;
    const q = (searchInput ? searchInput.value : "").trim().toLowerCase();
    const posts = S.getPosts().filter((post) => {
      if (!q) return true;
      const haystack = (
        post.title +
        " " +
        post.excerpt +
        " " +
        post.body.join(" ")
      ).toLowerCase();
      return haystack.indexOf(q) > -1;
    });

    grid.innerHTML = posts.length
      ? posts.map(card).join("")
      : '<p class="no-posts">مطلبی مطابق جستجوی شما پیدا نشد.</p>';

    grid.querySelectorAll(".wishlist-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const added = S.toggleWishlist("blog", btn.dataset.id);
        btn.classList.toggle("active", added);
        btn.setAttribute("aria-pressed", added ? "true" : "false");
        btn.innerHTML = (added ? HEART_ON : HEART) + " علاقه‌مندی";
        S.toast(
          added
            ? "مطلب به علاقه‌مندی‌ها اضافه شد."
            : "مطلب از علاقه‌مندی‌ها حذف شد."
        );
      });
    });

    requestAnimationFrame(() => {
      grid
        .querySelectorAll(".reveal-center")
        .forEach((el) => el.classList.add("is-visible"));
    });
  }

  if (searchInput) searchInput.addEventListener("input", renderPosts);

  document.body.classList.add("dark");
  renderPosts();
})();
