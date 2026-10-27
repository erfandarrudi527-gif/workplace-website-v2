/* ============================================================
   صفحه یک مطلب وبلاگ
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

  const postCard = document.getElementById("postCard");
  if (!postCard) return;

  const id = new URLSearchParams(window.location.search).get("id");
  const post = S.getPost(id);

  if (!post) {
    postCard.innerHTML = `
      <p class="post-missing">مطلب مورد نظر یافت نشد.</p>
      <a href="blog.html" class="post-back">${ARROW_L} بازگشت به وبلاگ</a>`;
    document.body.classList.add("dark");
    return;
  }

  document.title = post.title + " | وبلاگ آریا استور";
  const wished = S.isWished("blog", post.id);

  postCard.innerHTML = `
    ${post.image ? `<img class="post-cover" src="${post.image}" alt="${S.esc(post.title)}" decoding="async">` : ""}
    <div class="post-body">
      <span class="blog-date">${S.esc(post.date)}</span>
      <h1>${S.esc(post.title)}</h1>
      ${post.body.map((p) => `<p>${S.esc(p)}</p>`).join("")}
      <div class="post-footer">
        <a href="blog.html" class="post-back">${ARROW_L} بازگشت به وبلاگ</a>
        <button type="button" class="wishlist-btn${wished ? " active" : ""}" aria-pressed="${wished ? "true" : "false"}">
          ${wished ? HEART_ON : HEART} علاقه‌مندی
        </button>
      </div>
    </div>`;

  const wishBtn = postCard.querySelector(".wishlist-btn");
  if (wishBtn) {
    wishBtn.addEventListener("click", () => {
      const added = S.toggleWishlist("blog", post.id);
      wishBtn.classList.toggle("active", added);
      wishBtn.setAttribute("aria-pressed", added ? "true" : "false");
      wishBtn.innerHTML = (added ? HEART_ON : HEART) + " علاقه‌مندی";
      S.toast(
        added
          ? "مطلب به علاقه‌مندی‌ها اضافه شد."
          : "مطلب از علاقه‌مندی‌ها حذف شد."
      );
    });
  }

  document.body.classList.add("dark");
})();
